/**
 * EAS file env var sync for google-services.json
 *
 * Create EAS secret (type=file) named GOOGLE_SERVICES_JSON pointing to your local google-services.json
 * Then, during EAS builds, this hook copies it into the project root so Gradle/Expo can find it.
 */
const fs = require("fs");
const path = require("path");

const src = process.env.GOOGLE_SERVICES_JSON;
const dst = path.join(process.cwd(), "google-services.json");

// On EAS, file secrets are exposed as a path to a temporary file.
if (!src) {
  console.log("GOOGLE_SERVICES_JSON not set. Skipping google-services.json sync.");
  process.exit(0);
}

try {
  fs.copyFileSync(src, dst);
  console.log(`Copied GOOGLE_SERVICES_JSON -> ${dst}`);
} catch (e) {
  console.error("Failed to copy GOOGLE_SERVICES_JSON -> google-services.json");
  console.error(e);
  process.exit(1);
}
