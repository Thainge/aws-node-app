// Load local environment variables from .env for development.
// In AWS Lambda, environment variables are typically provided by the platform.
require("dotenv").config({ override: true, quiet: true });

const serverless = require("serverless-http");
const { createApp } = require("./src/app");

const { app, config } = createApp();

// Local development: `node index.js`
if (require.main === module) {
  app.listen(config.port, () => console.log(`Server running on ${config.port}`));
}

// AWS Lambda (API Gateway) entrypoint: set your handler to `index.handler`
module.exports.handler = serverless(app);