// plugins/withNonModularHeadersFix.js
// Podfile fixes + compatibility patches for old architecture (newArchEnabled: false)
// - Adds global `use_modular_headers!`
// - Adds post_install build settings for Firebase/GoogleUtilities + RNFBApp workaround
// - Patches podspec assertions that force New Architecture in:
//    * react-native-reanimated (RNReanimated.podspec)
//    * react-native-worklets (RNWorklets.podspec)

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

function commentOutLinesContaining(filePath, needles, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`[withNonModularHeadersFix] ${label} not found (skip): ${filePath}`);
    return;
  }
  let s = fs.readFileSync(filePath, "utf8");
  let changed = false;

  const lines = s.split("\n").map((line) => {
    for (const needle of needles) {
      if (line.includes(needle)) {
        if (line.trim().startsWith("#")) return line; // already commented
        changed = true;
        return line.replace(/^(\s*)/, "$1# ");
      }
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(`[withNonModularHeadersFix] Patched ${label} to bypass New Architecture assertion`);
  } else {
    console.log(`[withNonModularHeadersFix] ${label} already compatible (no assertion found / already patched)`);
  }
}

function patchPodspecsForOldArch(projectRoot) {
  // 1) Reanimated
  const reanimatedPodspec = path.join(
    projectRoot,
    "node_modules",
    "react-native-reanimated",
    "RNReanimated.podspec"
  );
  commentOutLinesContaining(
    reanimatedPodspec,
    ["assert_new_architecture_enabled("],
    "RNReanimated.podspec"
  );

  // 2) Worklets (react-native-worklets)
  const workletsPodspec = path.join(
    projectRoot,
    "node_modules",
    "react-native-worklets",
    "RNWorklets.podspec"
  );
  commentOutLinesContaining(
    workletsPodspec,
    ["worklets_assert_new_architecture_enabled("],
    "RNWorklets.podspec"
  );
}

module.exports = function withNonModularHeadersFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosDir = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const podfilePath = path.join(iosDir, "Podfile");

      // 0) Patch podspecs BEFORE pod install
      patchPodspecsForOldArch(projectRoot);

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
