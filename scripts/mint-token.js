const jwt = require("jsonwebtoken");

function parseArgs(argv) {
  const args = {};
  for (const entry of argv.slice(2)) {
    const [key, value] = entry.split("=");
    if (!key) continue;
    args[key.replace(/^--/, "")] = value ?? true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  const role = args.role;
  const sub = args.sub || "local";
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  if (!secret) {
    console.error("Missing JWT_SECRET env var");
    process.exit(1);
  }

  if (role !== "user" && role !== "admin") {
    console.error("Usage: node scripts/mint-token.js --role=user|admin [--sub=someone]");
    process.exit(1);
  }

  const token = jwt.sign({ sub, role }, secret, {
    algorithm: "HS256",
    expiresIn
  });

  process.stdout.write(token);
}

main();
