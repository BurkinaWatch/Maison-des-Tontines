const { getDefaultConfig } = require("expo/metro-config");
const http = require("node:http");

const config = getDefaultConfig(__dirname);

function proxyApiRequest(req, res) {
  const {
    "x-forwarded-for": _forwardedFor,
    "x-forwarded-host": _forwardedHost,
    "x-forwarded-proto": _forwardedProto,
    ...headers
  } = req.headers;

  const apiRequest = http.request(
    {
      hostname: "127.0.0.1",
      port: 4000,
      path: req.url,
      method: req.method,
      headers: {
        ...headers,
        host: "127.0.0.1:4000",
      },
    },
    (apiResponse) => {
      res.writeHead(apiResponse.statusCode || 502, apiResponse.headers);
      apiResponse.pipe(res);
    }
  );

  apiRequest.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "The API is unavailable. Please try again shortly." }));
  });

  req.pipe(apiRequest);
}

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  if (req.url?.startsWith("/api/")) {
    proxyApiRequest(req, res);
    return;
  }

  middleware(req, res, next);
};

module.exports = config;
