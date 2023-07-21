/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  tailwind: true,
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs", // enforce for vercel support
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_dev: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
