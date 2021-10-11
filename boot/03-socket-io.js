const log = core.makeLog("Yehat Backend");
const logSocket = core.makeLog("Socket IO");
log("Booting Socket IO.");

const logging = {
  sent: false,
  bcast: false
};

const io = require("socket.io")(core.mods.express.httpServer, {
  pingInterval: 60000,
  maxHttpBufferSize: 1e8,
  cors: {
    origin: "*", // http://127.0.0.1:8080/
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [ "my-custom-header" ],
    credentials: true
  },      
});

if (core.mods.express.httpsServer) io.attach(core.mods.express.httpsServer);

core.io = io;

core.bcast = ({ to, cmd, ...a }) => {
  if (logging.bcast) logSocket(`${to} [<=] ${cmd}`, a);
  io.to(to).emit({ cmd, ...a });
};

core.emit = ({ userID, cmd, ...a }) => {
  // core.log(`${to} [<=] ${cmd}`, a);
  // io.to(to).emit({ cmd, ...a });
  const user = ecs.root[userID];
  if (!user) {
    logSocket(`User ${userID} not found.`);
    return;
  }

  const session = ecs.find(v => v.session0 && v.session0.socketID && v.connections.user == userID);
  if (!session.length) {
    logSocket(`Unable to deliver a single message to user ${userID}, because there's no active session.`);
    /* postpone? */
    return;
  }

  if (logging.sent) logSocket(`[User ${userID}, socketID ${session[0].session0.socketID}] [<=] ${cmd}`, a);
  io.to(session[0].session0.socketID).emit({ cmd, ...a });
};

const ecs = core.ecs;

const onlineStat0 = ecs.root["asKIOU_CjC9Dw6HCpCNlw6"];

const noLog = [ "events0.move", "project0.deploy", "cargo2.saveCargo" ];

const noAck = () => {};
const directIOLog = core.makeLog("DirectIOModInterface");
const makeDirectIOModInterface = ({ socket }) => async ([ cmd, props = {}, ack = noAck ], next) => {
  // directIOLog(`[Socket ${socket.id}] [ => ]`, cmd, props);
  if (!~noLog.indexOf(cmd)) {
    directIOLog(cmd, props, ack == noAck ? "No Ack function!" : "");
  }
  if (typeof cmd != "string") return next();
  if (typeof props != "object") return next();

  let [ mod, method ] = cmd.split(".");
  if (!method) {  /* assume if there's no mod name passed, it is defaulted to "main0" */
    method = mod;
    mod = "main0";
  }

  const reply = (a) => {
    if (fn) {
      return fn(a);
    } else {
      directIOLog("No acknoledgement passed for", cmd, socket.id);
    }
  };

  /* Mod exists? */
  const theMod = core.mods[mod];
  if (!theMod) {
    directIOLog(`Mod ${mod} not found for command ${cmd} socketID ${socket.id}.`)
    return next();
  }
  
  /* Method exists? */
  const meth = `io${core.capitalize(method)}`; /* To expose a method, a MOD must implement the corresponding 
                                                  function, named "io" + core.capitalize(<method_name>). 
                                                  Literally, "io" PLUS METHOD NAME CAPITALIZED.

                                                  Ex.: To support method "deviceID", MOD [main0] implements
                                                  function "ioDeviceID".  */
  // console.log("mod, theMod, meth, _", mod, theMod, meth, theMod[meth]);

  if (!theMod[meth] || (typeof theMod[meth] != 'function')) {
    directIOLog(`Mod ${mod} ain't support method "${method}" for command ${cmd} socketID ${socket.id}.`)
    // console.log(`theMod`, theMod, '.method', theMod[method]);
    return next();
  }

  try {
    //const { userID, sessionID } = socket.data;
    const { sessionID } = socket.data;
    const session = ecs.root[sessionID];

    const output = (theMod[meth].constructor.name == 'AsyncFunction') ? 
      await theMod[meth](props, { socket, session }) :
            theMod[meth](props, { socket, session }); /* <= should pass basic user data here already! */

    if (ack) ack(output);
  } catch(e) {
    if (ack) ack({ code: "error", details: e.message });

    directIOLog(`Failure at MOD ${mod} METHOD "${method}"`, e); 
  }

  next();
};

io.on("connection", async (socket) => {
  let session = await ecs.create("Session0", {
    session0: {
      dtStart: core.microTime(),
      deviceID: null,
      socketID: socket.id
    }
  });

  socket.data = {
    sessionID: session.id
  };

  let SVTime = () => core.microTime() - session.session0.dtStart;
  let UpTime = () => core.microTime() - core.dtStart;

  log("Connection", socket.id, "uptime", core.microTime() - core.dtStart); 

  onlineStat0.stat0.value.total++;
  onlineStat0.stat0.value.guest++;

  socket.join("asKIOU_CjC9Dw6HCpCNlw6"); /* OnlineStat0 */

  core.bcast({ to: onlineStat0.id, cmd: "eu", id: onlineStat0.id, stat0: onlineStat0.stat0 });

  socket.emit("server", {
    time: core.dtToVTime(core.microTime()),
    id: core.serverID,
    online: onlineStat0.stat0.value
  });

  let directI = makeDirectIOModInterface({ socket });
  socket.use(directI);

  socket.on("disconnect", (reason) => {
    log("Disconnect", socket.id, reason);
    const session = ecs.root[socket.data.sessionID];
    const deviceID = session.session0.deviceID;

    if (core.mods.events0) core.mods.events0.disconnected({ socket });

    // const user = userFromDeviceID(deviceID);
    // if (user) {
    //   // console.log("disconnected user by deviceID", user);
    //   user.user0.sessionID = null;
    //   user.user0vtm.socketID = null;
    //   user.user0vtm.dtLastActivity = +new Date();
    //   user.user0vtm.online = false;
    //   user.save();
      
    //   onlineStat0.stat0.value.user--;
    //   onlineStat0.stat0.value.total--;
    // } else {
    //   onlineStat0.stat0.value.guest--;
    //   onlineStat0.stat0.value.total--;
    // }
    
    if (session.connections.user) {
      // session.c.user.user0.sessionID = null;
      session.c.user.user0vtm.socketID = null;
      session.c.user.user0vtm.dtLastActivity = core.microTime();
      session.c.user.saveFile.save();

      /* session ain't destroyed, and however, not saved anywhere - will stay in memory... a cleanup routine? */
      onlineStat0.stat0.value.user--;
    } else {
      onlineStat0.stat0.value.guest--;
    }

    onlineStat0.stat0.value.total--;
    core.bcast({ to: onlineStat0.id, cmd: "eu", id: onlineStat0.id, stat0: onlineStat0.stat0 });

    session.connections.user = null;

    core.log0({ name: "disconnect", deviceID, svTime: SVTime(), uptime: UpTime(), reason });
  });
});

  // socket.use(async (event, next) => {
  //   if (!Array.isArray(event)) return next();

  //   // console.log(">=", event[0], JSON.stringify(event[1]).length, 'Bytes');

  //   const fn = event[2];
  //   const reply = (a) => {
  //     if (fn) {
  //       return fn(a);
  //     } else {
  //       console.log("socket.id missed acknoledgement.", a);
  //     }
  //   };

