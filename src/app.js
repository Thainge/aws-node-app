const express = require("express");
const cors = require("cors");

const { getConfig } = require("./config");
const { getCollection } = require("./db/mongo");
const { createItemsRouter } = require("./routes/items");

function createApp() {
  const config = getConfig();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const getItemsCollection = () =>
    getCollection({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      collectionName: config.mongoCollection
    });

  app.use(
    "/items",
    createItemsRouter({
      getCollection: getItemsCollection
    })
  );

  // Minimal error handler (keeps details out of clients)
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return { app, config };
}

module.exports = {
  createApp
};
