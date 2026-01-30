// plugins/withNonModularHeadersFix.js
const { withPodfile } = require("@expo/config-plugins");

function ensureUseModularHeaders(contents) {
  // Ako već postoji, ne diramo
  if (/\buse_modular_headers!\b/.test(contents)) return contents;

  // Najsigurnije: ubaci odmah nakon platform :ios, ...
  const platformRegex = /^\s*platform\s*:ios[^\n]*\n/m;
  const match = contents.match(platformRegex);

  if (match) {
    return contents.replace(platformRegex, (m) => `${m}use_modular_headers!\n`);
  }

  // Fallback: ubaci na vrh
  return `use_modular_headers!\n${contents}`;
}

module.exports = function withNonModularHeadersFix(config) {
  return withPodfile(config, (config) => {
    let contents = config.modResults.contents;

    // ✅ NOVO: globalni use_modular_headers!
    contents = ensureUseModularHeaders(contents);

    // Postojeći fix: CLANG_ALLOW_NON_MODULAR...
    // Ako već postoji, ne diramo (ali smo gore možda dodali use_modular_headers!)
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
