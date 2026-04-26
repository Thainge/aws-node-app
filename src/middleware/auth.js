const jwt = require("jsonwebtoken");

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== "string") return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

function createAuthMiddleware({ jwtSecret }) {
  if (!jwtSecret) throw new Error("createAuthMiddleware: 'jwtSecret' is required");

  function requireAuth(req, res, next) {
    try {
      const token = getBearerToken(req);
      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      req.user = {
        sub: payload.sub,
        role: payload.role
      };

      return next();
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  function requireItemsAccess(req, res, next) {
    const role = req.user?.role;

    if (role === "admin") return next();

    if (role === "user") {
      if (req.method === "GET" || req.method === "POST") return next();
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.status(403).json({ error: "Forbidden" });
  }

  return {
    requireAuth,
    requireItemsAccess
  };
}

module.exports = {
  createAuthMiddleware
};
