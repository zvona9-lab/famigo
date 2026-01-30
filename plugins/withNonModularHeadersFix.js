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
    const clangSnippet = `
  installer.pods_project.targets.each do |t|
    t.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
`;

    // ✅ RNFirebase fix (Xcode modules): spriječi "RCTBridgeModule must be imported..." grešku
    // Ide u post_install i radi samo za RNFB* targete.
    const rnfbSnippet = `
  # RNFB modules fix (EAS/Xcode)
  installer.pods_project.targets.each do |target|
    if target.name.start_with?('RNFB')
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'
      end
    end
  end
`;

    const hasPostInstall = contents.includes("post_install do |installer|");

    // 1) Osiguraj post_install blok postoji
    if (!hasPostInstall) {
      contents += `

post_install do |installer|
end
`;
    }

    // 2) Ubaci clangSnippet ako već nije prisutan
    if (!contents.includes("CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES")) {
      contents = contents.replace(
        /post_install do \|installer\|\n/,
        (m) => m + clangSnippet
      );
    }

    // 3) Ubaci RNFB fix ako već nije prisutan (marker)
    if (!contents.includes("RNFB modules fix (EAS/Xcode)")) {
      contents = contents.replace(
        /post_install do \|installer\|\n/,
        (m) => m + rnfbSnippet
      );
    }

  installer.pods_project.targets.each do |t|
    t.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
`;

        config.modResults.contents = contents;
    return config;
  });
};
