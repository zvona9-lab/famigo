// plugins/withNonModularHeadersFix.js
const { withPodfile } = require("@expo/config-plugins");

module.exports = function withNonModularHeadersFix(config) {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;

    // Ako već postoji, ne diramo
    if (contents.includes("CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES")) {
      config.modResults.contents = contents;
      return config;
    }

    const snippet = `
  installer.pods_project.targets.each do |t|
    t.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
`;

    if (contents.includes("post_install do |installer|")) {
      // Ubaci odmah nakon post_install linije
      contents = contents.replace(
        /post_install do \|installer\|\n/,
        (m) => m + snippet
      );
    } else {
      // Dodaj cijeli post_install blok na kraj
      contents += `

post_install do |installer|
${snippet}
end
`;
    }

    config.modResults.contents = contents;
    return config;
  });
};
