module.exports = {
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
  typescript: true,
  jsxRuntime: 'automatic',
  replaceAttrValues: {
    '#000000': 'currentColor',
    '#000': 'currentColor',
    black: 'currentColor',
  },
};
