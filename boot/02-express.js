core.log("[Yehat Backend]Booting Express.");

const express = require('express');
const fs = require("fs");
const path = require('path');
const fallback = require('express-history-api-fallback');
const app = express();
const httpServer = require("http").createServer(app);

const options = {
  // key: fs.readFileSync('./keys/localhost.key'),
  // cert: fs.readFileSync('./keys/localhost.crt')
};

// const httpsServer = require("https").createServer(options, app);

const corsALL = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.send(200);
  } else {
    return next();
  }
};

const rootPath = path.join(__dirname, '../public');

app.use("/storage", (req, res, next) => {
  console.log("storage request", req.url, path.join(__dirname, '../../storage', req.url));
  //res.sendFile(path.join(__dirname, '../../storage', req.url));
  next();
}, express.static(path.normalize(path.join(__dirname, '../../storage'))));
app.use(corsALL, express.static(rootPath));
//, express.static(path.normalize(path.join(__dirname, '../../storage/')))

app.use(/^\/api.*/, express.json({ limit: '50mb' }), express.urlencoded({ extended: true }));
app.use(/^(?!\/api|\/api-raw|\/socket|\/storage).*/, fallback('index.html', { root: rootPath }));

app.all("/api/git/push", (req, res) => {
  res.end();

  const { exec } = require('child_process');
  exec('./shell/update.sh',
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
      }
    }
  );
});

const port = 8100;
// const portSSL = 8092;    
httpServer.listen(port); // <== 
// httpsServer.listen(portSSL); // <== 

core.log("\x1b[35m--[\x1b[04m Yehat Backend \x1b[m\x1b[35m]--[ %s ]--[ %s\x1b[m", core.vTimeNow(), `Listening on port ${port}`);
// core.log("\x1b[35m--[\x1b[04m Yehat Backend \x1b[m\x1b[35m]--[ %s ]--[ %s\x1b[m", core.vTimeNow(), `Listening on port ${port}, ${portSSL} SSL`);    

// console.log("APP!", app);

core.mods.express = {
  app, httpServer /*, httpsServer */
};