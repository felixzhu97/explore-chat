module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "@emotion",
        {
          sourceMap: true,
          autoLabel: "dev-only",
          labelFormat: "[local]",
          cssPropOptimization: true,
        },
      ],
    ],
  };
};
