// Minimal static server so Firebase sign-in popups work (they don't on file:// pages).
// Usage: node server.js (inside backend/) or node backend/server.js (from project root) -> http://localhost:5500
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.env.STATIC_ROOT
  ? path.resolve(process.env.STATIC_ROOT)
  : path.resolve(__dirname, "../frontend");
const port = process.env.PORT || 5500;
// Docker/Kubernetes set HOST=0.0.0.0 so the server is reachable from outside the container.
const host = process.env.HOST || "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }
  if (urlPath === "/") urlPath = "/home.html";
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`Yantra backend running at http://${host}:${port}`);
  console.log(`Serving frontend static files from: ${root}`);
});
