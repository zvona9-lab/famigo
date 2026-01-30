// plugins/withNonModularHeadersFix.js
// Podfile fixes + Reanimated podspec compatibility for old architecture (newArchEnabled: false)

const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function ensureUseModularHeaders(podfile) {
  if (/\buse_modular_headers!\b/.test(podfile)) return podfile;

  const platformLine = podfile.match(/^\s*platform\s*:ios[^\n]*\n/m);
  if (platformLine) {
    return podfile.replace(platformLine[0], `${platformLine[0]}use_modular_headers!\n`);
  }
  return `use_modular_headers!\n${podfile}`;
}

function ensurePostInstallHook(podfile, snippet) {
  if (podfile.includes(snippet.trim())) return podfile;

  const postInstallStart = podfile.match(/^\s*post_install\s+do\s+\|installer\|\s*\n/m);
  if (postInstallStart) {
    return podfile.replace(postInstallStart[0], `${postInstallStart[0]}${snippet}\n`);
  }

  const block = `\npost_install do |installer|\n${snippet}\nend\n`;
  return `${podfile.trim()}\n${block}`;
}

function patchReanimatedPodspec(projectRoot) {
  // In some versions, RNReanimated.podspec enforces New Architecture and fails when RCT_NEW_ARCH_ENABLED=0.
  // We keep newArchEnabled=false (for RNFirebase), so we patch out the assertion.
  const podspecPath = path.join(projectRoot, "node_modules", "react-native-reanimated", "RNReanimated.podspec");

  if (!fs.existsSync(podspecPath)) {
    console.log(`[withNonModularHeadersFix] Reanimated podspec not found (skip): ${podspecPath}`);
    return;
  }

  let s = fs.readFileSync(podspecPath, "utf8");
  if (!s.includes("assert_new_architecture_enabled")) {
    console.log("[withNonModularHeadersFix] Reanimated podspec has no new-arch assertion (skip)");
    return;
  }

  // Comment out any line that calls assert_new_architecture_enabled(...)
  const updated = s
    .split("\n")
    .map((line) => {
      if (line.includes("assert_new_architecture_enabled(")) {
        if (line.trim().startsWith("#")) return line;
        return line.replace(/^(\s*)/, "$1# ");
      }
      return line;
    })
    .join("\n");

  if (updated !== s) {
    fs.writeFileSync(podspecPath, updated, "utf8");
    console.log("[withNonModularHeadersFix] Patched RNReanimated.podspec to disable new-arch assertion");
  } else {
    console.log("[withNonModularHeadersFix] RNReanimated.podspec already patched");
  }
}

module.exports = function withNonModularHeadersFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosDir = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const podfilePath = path.join(iosDir, "Podfile");

      // 0) Patch Reanimated podspec BEFORE pod install
      patchReanimatedPodspec(projectRoot);

      if (!fs.existsSync(podfilePath)) {
        console.warn(`[withNonModularHeadersFix] Podfile not found at: ${podfilePath}`);
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");

      // 1) Global modular headers
      podfile = ensureUseModularHeaders(podfile);

      // 2) post_install fixes
      const NON_MODULAR_FIX = [
        "  # Allow non-modular includes in framework modules (Firebase / GoogleUtilities)",
        "  installer.pods_project.targets.each do |target|",
        "    target.build_configurations.each do |config|",
        "      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "    end",
        "  end",
      ].join("\n");

      const RNFB_XCODE_WORKAROUND = [
        "  # RNFirebase + Xcode modules workaround (scoped to RNFBApp)",
        "  installer.pods_project.targets.each do |target|",
        "    next unless target.name == 'RNFBApp'",
        "    target.build_configurations.each do |config|",
        "      # Avoid \"must be imported from module 'RNFBApp.RNFBAppModule'\" errors",
        "      config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'",
        "    end",
        "  end",
      ].join("\n");

      podfile = ensurePostInstallHook(podfile, `${NON_MODULAR_FIX}\n\n${RNFB_XCODE_WORKAROUND}`);

      fs.writeFileSync(podfilePath, podfile, "utf8");
      console.log("[withNonModularHeadersFix] Podfile updated (use_modular_headers + post_install fixes)");

      return config;
    },
  ]);
};
