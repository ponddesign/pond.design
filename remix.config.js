/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  tailwind: true,
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs", // enforce for vercel support
};
