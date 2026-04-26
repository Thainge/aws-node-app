function parseBool(value) {
  if (value == null) return false;
  if (typeof value !== "string") return Boolean(value);

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "y":
    case "on":
      return true;
    default:
      return false;
  }
}

function getConfig() {
  return {
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
    mongoDbName: process.env.MONGODB_DB || "aws_node_app",
    mongoCollection: process.env.MONGODB_COLLECTION || "items",
    authDisabled: parseBool(process.env.AUTH_DISABLED),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    port: process.env.PORT ? Number(process.env.PORT) : 3001
  };
}

module.exports = {
  getConfig
};
