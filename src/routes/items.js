const express = require("express");
const { randomUUID } = require("crypto");
// Auth is intentionally disabled for now.
// const { createAuthMiddleware } = require("../middleware/auth");

function createItemsRouter({ getCollection } = {}) {
  if (!getCollection) throw new Error("createItemsRouter: 'getCollection' is required");

  const router = express.Router();

  const noop = (req, res, next) => next();
  const requireAuth = noop;
  const requireItemsAccess = noop;

  // If/when you want to re-enable JWT auth, restore something like:
  // const { requireAuth, requireItemsAccess } = createAuthMiddleware({ jwtSecret });

  // CREATE
  router.post("/", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const { _id, ...data } = req.body || {};
      const item = { id: randomUUID(), ...data };

      const result = await collection.insertOne(item);
      res.json({ ...item, _id: String(result.insertedId) });
    } catch (error) {
      next(error);
    }
  });

  // READ
  router.get("/", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const items = await collection.find({}).toArray();

      res.json(
        items.map((doc) => {
          const _id = doc?._id ? String(doc._id) : undefined;
          const id = doc?.id ?? _id;
          return { ...doc, _id, id };
        })
      );
    } catch (error) {
      next(error);
    }
  });

  // UPDATE
  router.put("/:id", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const { id } = req.params;
      const { _id, ...data } = req.body || {};

      await collection.updateOne(
        { id },
        {
          $set: {
            id,
            ...data
          }
        },
        { upsert: true }
      );

      res.json({ id, ...data });
    } catch (error) {
      next(error);
    }
  });

  // DELETE
  router.delete(
    "/:id",
    requireAuth,
    requireItemsAccess,
    async (req, res, next) => {
    try {
      const collection = await getCollection();
      const { id } = req.params;

      await collection.deleteOne({ id });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
    }
  );

  return router;
}

module.exports = {
  createItemsRouter
};
