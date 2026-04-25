const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

function createItemsRouter({ dynamo, tableName }) {
  if (!dynamo) throw new Error("createItemsRouter: 'dynamo' is required");
  if (!tableName) throw new Error("createItemsRouter: 'tableName' is required");

  const router = express.Router();

  // CREATE
  router.post("/", async (req, res, next) => {
    try {
      const item = { id: uuidv4(), ...req.body };

      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: item
        })
      );

      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  // READ
  router.get("/", async (req, res, next) => {
    try {
      const result = await dynamo.send(
        new ScanCommand({
          TableName: tableName
        })
      );

      res.json(result.Items);
    } catch (error) {
      next(error);
    }
  });

  // UPDATE
  router.put("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: { id, ...req.body }
        })
      );

      res.json({ id, ...req.body });
    } catch (error) {
      next(error);
    }
  });

  // DELETE
  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      await dynamo.send(
        new DeleteCommand({
          TableName: tableName,
          Key: { id }
        })
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createItemsRouter
};
