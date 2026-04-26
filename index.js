const serverless = require("serverless-http");
const { createApp } = require("./src/app");

// Load local environment variables from .env for development.
// In AWS Lambda, environment variables are provided by the platform.
if (require.main === module) {
  const isLambda = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV
  );

  if (!isLambda) {
    require("dotenv").config({ override: false, quiet: true });
  }
}

const { app, config } = createApp();

// Local development: `node index.js`
if (require.main === module) {
  app.listen(config.port, () => console.log(`Server running on ${config.port}`));
}

// AWS Lambda (API Gateway) entrypoint: set your handler to `index.handler`
module.exports.handler = serverless(app);