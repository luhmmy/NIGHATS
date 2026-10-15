import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { PERMISSIONS, ROLE_DEFS, ROLES } from "../src/lib/rbac";

const prisma = new PrismaClient();

const ARGON_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

async function main() {
  // 1. Permissions
  const permissionKeys = Object.values(PERMISSIONS);
  for (const key of permissionKeys) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }
  const allPerms = await prisma.permission.findMany();
  const permByKey = new Map(allPerms.map((p) => [p.key, p.id]));

  // 2. Roles + their permission grants
  for (const [name, def] of Object.entries(ROLE_DEFS)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { label: def.label, description: def.description, isSystem: true },
      create: {
        name,
        label: def.label,
        description: def.description,
        isSystem: true,
      },
    });

    // Reset grants to match the definition (idempotent).
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: def.permissions
        .map((key) => permByKey.get(key))
        .filter((id): id is string => !!id)
        .map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }

  // 3. Initial SUPER_ADMIN
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@nighats.dev").toLowerCase();
  const DEV_DEFAULT_PASSWORD = "change-me-ChangeMe!2027";
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEV_DEFAULT_PASSWORD;

  // Never seed a super admin with the well-known default password outside dev —
  // that would be a publicly-known credential on a privileged account.
  if (process.env.NODE_ENV === "production" && password === DEV_DEFAULT_PASSWORD) {
    throw new Error(
      "Refusing to seed: set SEED_ADMIN_PASSWORD to a strong, unique value before seeding in production."
    );
  }

  const superRole = await prisma.role.findUniqueOrThrow({
    where: { name: ROLES.SUPER_ADMIN },
  });

  const passwordHash = await hash(password, ARGON_OPTS);

  await prisma.user.upsert({
    where: { email },
    update: { roleId: superRole.id, isActive: true },
    create: {
      email,
      name: "Root Admin",
      handle: "root@nighats",
      passwordHash,
      isActive: true,
      roleId: superRole.id,
      emailVerified: new Date(),
    },
  });

  console.log("Seed complete.");
  console.log(`  Permissions: ${permissionKeys.length}`);
  console.log(`  Roles:       ${Object.keys(ROLE_DEFS).length}`);
  console.log(`  Super admin: ${email}`);
  console.log("  >> Database initialized with clean schemas and Super Admin account.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
