const mongoose = require("mongoose");

const GLOBAL_CACHE_KEY = "__aws_node_app_mongoose__";

function getGlobalCache() {
  const globalCache = globalThis[GLOBAL_CACHE_KEY] || {
    connectPromise: undefined
  };

  globalThis[GLOBAL_CACHE_KEY] = globalCache;
  return globalCache;
}

async function connectMongoose({ uri, dbName } = {}) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string missing. Set MONGODB_URI (or pass { uri })."
    );
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) return;

  const cache = getGlobalCache();
  if (!cache.connectPromise) {
    cache.connectPromise = mongoose
      .connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 10_000
      })
      .catch((error) => {
        cache.connectPromise = undefined;
        throw error;
      });
  }

  await cache.connectPromise;
}

async function getMongoClient({ uri, dbName } = {}) {
  await connectMongoose({ uri, dbName });

  if (typeof mongoose.connection.getClient === "function") {
    return mongoose.connection.getClient();
  }

  // Fallback for older mongoose versions
  if (mongoose.connection.client) return mongoose.connection.client;
  throw new Error("MongoDB client is not available on the mongoose connection.");
}

async function getCollection({ uri, dbName, collectionName } = {}) {
  const resolvedDbName = dbName || process.env.MONGODB_DB || "aws_node_app";
  const resolvedCollectionName =
    collectionName || process.env.MONGODB_COLLECTION || "items";

  await connectMongoose({ uri, dbName: resolvedDbName });

  // Use the underlying MongoDB driver collection so existing route code works unchanged.
  const mongoClient = await getMongoClient({ uri, dbName: resolvedDbName });
  return mongoClient.db(resolvedDbName).collection(resolvedCollectionName);
}

module.exports = {
  getMongoClient,
  getCollection
};
