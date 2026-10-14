/**
 * Unguessable secret admin route endpoint.
 *
 * Configurable via `ADMIN_SECRET_PATH` or `NEXT_PUBLIC_ADMIN_SECRET_PATH` in environment variables.
 * Default is a high-entropy secret path so the admin endpoint cannot be guessed
 * or probed by scanners and bots.
 */
export const ADMIN_SECRET_PATH =
  process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH ||
  process.env.ADMIN_SECRET_PATH ||
  "hq-7f9a2b4c8e1d";

/**
 * Returns the public secret path for an admin subpath.
 * e.g. getAdminPath() => "/hq-7f9a2b4c8e1d"
 *      getAdminPath("/registrations") => "/hq-7f9a2b4c8e1d/registrations"
 */
export function getAdminPath(subpath: string = ""): string {
  const clean = subpath.startsWith("/") ? subpath : subpath ? `/${subpath}` : "";
  return `/${ADMIN_SECRET_PATH}${clean}`;
}
