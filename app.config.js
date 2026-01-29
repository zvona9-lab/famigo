const appJson = require("./app.json");

module.exports = ({ config }) => {
  // merge: prvo expo config, pa app.json, pa osiguraj plugins
  const merged = {
    ...config,
    ...appJson.expo,
  };

  merged.plugins = [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" },
      },
    ],
    "expo-localization",
    "@react-native-community/datetimepicker",
    "expo-font",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          useModularHeaders: true,
        },
      },
    ],
    require("./plugins/withNonModularHeadersFix"),
  ];

  return merged;
};
