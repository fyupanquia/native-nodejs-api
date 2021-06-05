const http = require("http");
const https = require("https");
const { StringDecoder } = require("string_decoder");
const env = require("./config");
const _data = require("./data");
const handlers = require("./handlers");
const helpers = require("./helpers");
const fs = require("fs");
const path = require("path");
const util = require("util");
const debug = util.debuglog("server"); // set NODE_DEBUG=server&&node index.js

const server = {};
server.httpServer = http.createServer(function (req, res) {
  req.httpProtocol = "http";
  req.httpPort = env.httpPort;
  server.unifiedServer(req, res);
});

const httpServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "./../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./../https/cert.pem")),
};
server.httpsServer = https.createServer(httpServerOptions, function (req, res) {
  req.httpProtocol = "https";
  req.httpPort = env.httpPort;
  server.unifiedServer(req, res);
});

server.unifiedServer = (req, res) => {
  //debug(req.url);
  //const parsedUrl = new url.URL(req.url); // url.UrlWithParsedQuery(req.url, true);
  //const path = parsedUrl.pathaname;
  const parsedUrl = new URL(
    `${req.httpProtocol}://localhost:${env.httpPort}${req.url}`
  );
  const path = parsedUrl.pathname;
  const queryStringObject = parsedUrl.searchParams.toString().length
    ? JSON.parse(
        '{"' +
          decodeURIComponent(parsedUrl.searchParams.toString())
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
          '"}'
      )
    : {};
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const method = req.method.toLowerCase();
  const headers = req.headers;

  // get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let payload = "";

  req.on("data", (data) => {
    payload += decoder.write(data);
  });

  req.on("end", () => {
    payload += decoder.end();

    let chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;

    // If the request is within the public directory use to the public handler instead
    chosenHandler =
      trimmedPath.indexOf("public/") > -1 ? handlers.public : chosenHandler;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(payload),
    };
    chosenHandler(data, (statusCode, payload, contentType) => {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      //payload = typeof payload === "object" ? payload : {};
      contentType = contentType ? contentType : "json";
      //const payloadStr = JSON.stringify(payload);

      // Return the response parts that are content-type specific
      var payloadString = "";
      if (contentType == "json") {
        res.setHeader("Content-Type", "application/json");
        payload = typeof payload == "object" ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      if (contentType == "html") {
        res.setHeader("Content-Type", "text/html");
        payloadString = typeof payload == "string" ? payload : "";
      }

      if (contentType == "favicon") {
        res.setHeader("Content-Type", "image/x-icon");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "plain") {
        res.setHeader("Content-Type", "text/plain");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "css") {
        res.setHeader("Content-Type", "text/css");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "png") {
        res.setHeader("Content-Type", "image/png");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      if (contentType == "jpg") {
        res.setHeader("Content-Type", "image/jpeg");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug(
          "\x1b[32m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      } else {
        debug(
          "\x1b[31m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      }

      //debug("Request: " + trimmedPath);
      //debug("Method: " + method);
      //debug("Query: ", query);
      //debug("Headers: ", headers);
      //debug("payload: ", payload);
    });
  });
};
server.router = {
  //sample: handlers.sample,
  "": handlers.index,
  "account/create": handlers.accountCreate,
  "account/edit": handlers.accountEdit,
  "account/deleted": handlers.accountDeleted,
  "session/create": handlers.sessionCreate,
  "session/deleted": handlers.sessionDeleted,
  "checks/all": handlers.checksList,
  "checks/create": handlers.checksCreate,
  "checks/edit": handlers.checksEdit,
  ping: handlers.ping,
  "api/users": handlers.users,
  "api/tokens": handlers.tokens,
  "api/checks": handlers.checks,
  "favicon.ico": handlers.favicon,
  public: handlers.public,
};
server.init = () => {
  server.httpServer.listen(env.httpPort, () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `server running at http://localhost:${env.httpPort} in ${env.name} mode`
    );
  });

  server.httpsServer.listen(env.httpsPort, function () {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `server running at https://localhost:${env.httpsPort} in ${env.name} mode`
    );
  });
};

module.exports = server;
