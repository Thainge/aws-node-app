const express = require("express");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
// Auth is intentionally disabled for now.
// const { createAuthMiddleware } = require("../middleware/auth");

function createItemsRouter({ getCollection } = {}) {
  if (!getCollection) throw new Error("createItemsRouter: 'getCollection' is required");

  const router = express.Router();

  const noop = (req, res, next) => next();
  const requireAuth = noop;
  const requireItemsAccess = noop;

  function normalizeDoc(doc) {
    const { _id, ...rest } = doc || {};
    const id = rest?.id ?? (_id ? String(_id) : undefined);
    return { ...rest, id };
  }

  function tryParseObjectId(value) {
    if (typeof value !== "string") return undefined;
    if (!/^[a-fA-F0-9]{24}$/.test(value)) return undefined;
    if (!mongoose.Types.ObjectId.isValid(value)) return undefined;
    return new mongoose.Types.ObjectId(value);
  }

  // If/when you want to re-enable JWT auth, restore something like:
  // const { requireAuth, requireItemsAccess } = createAuthMiddleware({ jwtSecret });

  // CREATE
  router.post("/", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const body = req.body || {};
      const itemId = body.id ?? randomUUID();
      const data = { ...body };
      delete data._id;
      delete data.id;

      const item = { id: itemId, ...data };

      await collection.insertOne(item);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  // READ
  router.get("/", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const items = await collection.find({}).toArray();

      res.json(items.map(normalizeDoc));
    } catch (error) {
      next(error);
    }
  });

  // UPDATE
  router.put("/:id", requireAuth, requireItemsAccess, async (req, res, next) => {
    try {
      const collection = await getCollection();
      const { id } = req.params;
      const data = { ...(req.body || {}) };
      delete data._id;
      delete data.id;
      const objectId = tryParseObjectId(id);

      // Prefer updating by the app-level `id` field (UUID style).
      // If nothing matches and the param looks like a Mongo ObjectId, try `_id`.
      let filter = { id };
      let update = { $set: { id, ...data } };
      let result = await collection.updateOne(filter, update);

      if (result.matchedCount === 0 && objectId) {
        filter = { _id: objectId };
        update = { $set: { ...data } };
        result = await collection.updateOne(filter, update);
      }

      if (result.matchedCount === 0) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      const updated = await collection.findOne(filter);
      if (!updated) {
        res.json({ id, ...data });
        return;
      }

      res.json(normalizeDoc(updated));
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

      const objectId = tryParseObjectId(id);
      let result = await collection.deleteOne({ id });

      if (result.deletedCount === 0 && objectId) {
        result = await collection.deleteOne({ _id: objectId });
      }

      if (result.deletedCount === 0) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

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
