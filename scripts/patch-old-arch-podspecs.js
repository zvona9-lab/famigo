/**
 * scripts/patch-old-arch-podspecs.js
 *
 * Ensures iOS pod install doesn't fail when New Architecture is disabled (newArchEnabled: false)
 * by commenting out strict assertions in:
 * - react-native-reanimated/RNReanimated.podspec
 * - react-native-worklets/RNWorklets.podspec
 *
 * This runs in `postinstall`, so it executes AFTER node_modules is installed
 * and BEFORE EAS runs `pod install` on iOS.
 */
const fs = require("fs");
const path = require("path");

function commentOutNeedles(filePath, needles) {
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-old-arch] skip (not found): ${filePath}`);
    return { changed: false, skipped: true };
  }
  const original = fs.readFileSync(filePath, "utf8");
  const lines = original.split("\n");
  let changed = false;

  const patched = lines.map((line) => {
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
    fs.writeFileSync(filePath, patched.join("\n"), "utf8");
    console.log(`[patch-old-arch] patched: ${filePath}`);
  } else {
    console.log(`[patch-old-arch] ok (no change): ${filePath}`);
  }
  return { changed, skipped: false };
}

function main() {
  const root = process.cwd();

  const reanimated = path.join(root, "node_modules", "react-native-reanimated", "RNReanimated.podspec");
  const worklets = path.join(root, "node_modules", "react-native-worklets", "RNWorklets.podspec");

  commentOutNeedles(reanimated, ["assert_new_architecture_enabled("]);
  commentOutNeedles(worklets, ["worklets_assert_new_architecture_enabled("]);
}

main();
