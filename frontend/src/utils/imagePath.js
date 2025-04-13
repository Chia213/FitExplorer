/**
 * Fixes asset paths for production
 */
export function fixAssetPath(path) {
  if (!path) return "/assets/placeholder-exercise.png";
  if (path.startsWith("/src/assets/")) {
    return path.replace("/src/assets/", "/assets/");
  }
  return path;
}
