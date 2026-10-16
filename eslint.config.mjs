import next from "eslint-config-next";

// Next.js 16 ships ESLint flat config and removed `next lint`. `eslint-config-next`
// exports a ready-made flat-config array (core-web-vitals + typescript), so we
// spread it directly — no @eslint/eslintrc / FlatCompat bridge needed.
const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "prisma/**"],
  },
];

export default eslintConfig;
