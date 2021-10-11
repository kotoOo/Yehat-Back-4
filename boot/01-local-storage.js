// const ecs = require("../mods/ecs.js");

core.log("[Yehat Backend]Booting localStorage (stub).");
global.localStorage = {};

const publicRoot = "public-root";
const log0RootID = 'log0';
const user0Root = 'users';
const ID_CARGO_OTPS_0 = "otps0";
const ID_FAUCETS_0 = "faucets0";
const ID_CARGO_EMAIL_0 = "emailDelivery0";

module.exports.runAsync = async () => {
  await require("../yehat/backend0.js");
  await core.ecs.loadLocalInstances();

  core.userFromDeviceID = (deviceID) => {
    const a = ecs.find(item => item.user0 && ~item.user0.deviceIDs.indexOf(deviceID));
    if (!a.length) return null;
  
    return a[0];
  };

  await ecs.create("Cargo0", {
    id: log0RootID,
    saveFile: {}
  }).then(r => r.saveFile.save());

  
  await ecs.create("Cargo0", {
    id: user0Root,
    saveFile: {}
  }).then(r => r.saveFile.save());

  
  await ecs.create("Cargo0", {
    id: publicRoot,
    saveFile: {}
  }).then(r => r.saveFile.save());

  await ecs.create("Cargo0", {
    id: ID_CARGO_OTPS_0,
    saveFile: {}
  }).then(r => r.saveFile.save());

  await ecs.create("Cargo0", {
    id: ID_FAUCETS_0,
    saveFile: {}
  }).then(r => r.saveFile.save());

  await ecs.create("Cargo0", {
    id: ID_CARGO_EMAIL_0,
    saveFile: {}
  }).then(r => r.saveFile.save());

  // await ecs.create("Cargo0", {
  //   id: ID_USED_TICKETS,
  //   saveFile: {}
  // }).then(r => r.saveFile.save());
  
  core.log0 = async ({ deviceID, svTime, socket = null, type, ...a }) => { /* now svTime might be auto inferred from socket */
    const SVTime = (socket) => core.microTime() - socket.data.dtSessionStart;   

    const log0 = await ecs.create("Log0", {
      log0: {
        deviceID,
        dt: core.time(),
        vTime: core.vTimeNow(),
        name: type || "normal", /* Enum, there're many types of log0 records are available. */
        details: a,
        sessionID: null,
        ip: null,
        svTime: svTime ? core.dtToVTime(svTime, true) : (
          socket ? SVTime(socket) : null
        )
      }
    });

    await log0.saveFile.save();

    if (core.io) core.io.to("log0").emit("e", log0);
    core.log("[Log0]", log0.log0);
    return log0;
  };

  core.logu = async ({ session, ...a }) => {


  };

  await ecs.create("OnlineStat0", { id: "asKIOU_CjC9Dw6HCpCNlw6" });
};
