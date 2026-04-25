function getConfig() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

  return {
    region: region || "us-east-1",
    tableName: process.env.TABLE_NAME || "Items",
    port: process.env.PORT ? Number(process.env.PORT) : 3001
  };
}

module.exports = {
  getConfig
};
