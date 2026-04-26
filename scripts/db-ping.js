require("dotenv").config({ override: true, quiet: true });

const mongoose = require("mongoose");

function redactMongoUri(uri) {
  if (!uri) return "[missing]";
  // Best-effort redaction of username:password@ in MongoDB URIs.
  return uri.replace(/\/\/([^:]+):([^@]+)@/g, "//$1:***@");
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    console.error("MONGODB_URI is missing. Set it in .env (local) or Lambda env vars.");
    process.exit(1);
  }

  console.log("Connecting to:", redactMongoUri(uri));
  if (dbName) console.log("DB:", dbName);

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10_000
    });

    console.log("OK: connected");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const message = String(error && error.message ? error.message : error);

    if (message.toLowerCase().includes("authentication failed") || message.toLowerCase().includes("bad auth")) {
      console.error("FAILED: Atlas authentication failed.");
      console.error("Fix checklist:");
      console.error("- Atlas > Database Access: verify the username/password (reset password if unsure)");
      console.error("- If password has special chars (#, @, :, /, etc), URL-encode it or change it to a URL-safe password");
      console.error("- Ensure the user has at least readWrite on your DB (e.g. AWS-DB)");
    } else {
      console.error("FAILED:", message);
    }

    process.exit(1);
  }
}

main();
