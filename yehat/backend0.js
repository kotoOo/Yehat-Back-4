const { ecs } = require("./ecs.cjs");

const log0RootID = 'log0';
const user0Root = 'users';

// const logging = {
//   saveFile: 0
// };

// ecs.define("saveFile", {
//   save: (item) => async() => {
//     const fs = require("fs/promises");
//     const a = { id: item.id, type: item.type };
//     for (let key in item.saveFile) {
//       let v = item.saveFile[key];

//       if (key == "forceUpgrade") continue;

//       if (Array.isArray(v)) {
//         a[key] = {};
//         v.forEach(name => {
//           if (item[key]) a[key][name] = item[key][name]
//         });
//       } else if (v === true) {
//         a[key] = item[key];
//       }
//     }

//     let location = null;
//     // console.log(`Saving [${item.meta ? item.meta.name : item.type}] ${item.id}...`, item.located);
//     if (item.located && item.located.rel) {
//       await fs.mkdir(`./file-db/${item.located.rel}`).catch(e => {
//         if (e.code != 'EEXIST') {
//           core.log("[ECS]saveFile.save mkdir error", e);
//         } else {
//           return fs.chmod(`./file-db/${item.located.rel}`, 0o755);
//         }
//       });      

//       location = `./file-db/${item.located.rel}/${item.id}.json`;
//     } else {
//       location = `./file-db/${item.id}.json`;
//     }

//     return fs.writeFile(location, JSON.stringify(a)).then(() => {      
//       if (logging.saveFile) core.log(`[ECS]Saved File Instance [${item.meta ? item.meta.name : item.type}] #${item.id}.`);
//       // core.log(JSON.stringify(a, null, 2));
//       if (!item.type) core.log("Warning! No type.");
//     });
//   }
// }, { details: "JSON files-based persistence." });

ecs.define("file0", {
  filename: "",
  path: '',
  data: null,
  exists: false
}, { details: "An abstract file, maybe even virtual or real." });

ecs.declareType("File0", [
  ecs.compo.file0(),
  ecs.compo.meta({ name: "Abstract File", type: "File0" }),
  ecs.compo.saveFile({ file0: true })
], { details: "An abstract file, maybe even virtual or real." });

ecs.define("log0", {
  deviceID: null,
  dt: null,
  vTime: null, /* Epoch time, started at 14th May '21 */
  svTime: null, /* Session time started with WebSocket connection */
  name: "default", /* Enum, there're many types of log0 records are available. */
  details: "",
  sessionID: null,
  ip: null
});

ecs.declareType("Cargo1", [
  ecs.compo.meta({ type: "Cargo1", name: "Cargo" }),
  ecs.compo.saveFile({})
], { details: "User uploaded Entity." });

ecs.declareType("Log0", [
  ecs.compo.log0(),
  ecs.compo.saveFile({ log0: true }),
  ecs.compo.meta({
    name: "Log Record 0",
    type: "Log0"
  }),
  ecs.compo.located({ rel: log0RootID })
], { details: "A Basic Log Record, containing deviceID and vTime timestamp along with just unix timestamp." });

ecs.define("user0", { /* not intended to update often, in realtime. for realtime values - see user0vtm and etc. */
  sessionID: null, /* */
  deviceIDs: [],
  memberID: null, /* in host system - PL */
  origin: null, /* host system name, domain for memberID - PL, LA, PropSkip... */
  name: "noname", /* Nickname URL-friendly characters */
  status: "Hey, I'm just a visitor.",
  level: 0,
  email: null,
  emailVerified: false,
  promo: null
}, { details: "Basic User record." });

ecs.define("user0vtm", {
  socketID: null,
  dtCreated: null,
  dtSessionStart: null,
  dtLastActivity: null,
  online: false
});

ecs.declareType("User0", [
  ecs.compo.user0(),
  ecs.compo.user0vtm(),
  ecs.compo.meta({ name: "Basic User", type: "User0" }),
  ecs.compo.located({ rel: user0Root }),
  ecs.compo.saveFile({ user0: true, user0vtm: true, user0secrets: true })
]);

ecs.define("password0", {
  password: null,
  valid: true,
  on: null
}, { details: "A password. on - deviceID where password was issued." });

ecs.declareType("Password0", [
  ecs.compo.meta({ name: "Linking Password", type: "Password0" }),
  ecs.compo.password0(),
  ecs.compo.connections({
    owner: null
  }),
  ecs.compo.located(),
  ecs.compo.saveFile({ password0: true, connections: true, located: true })
]);

ecs.define("stat0", {
  name: "No name", /* caption */
  value: 0,
  dt: null
}, { details: "An arbitrary counter." });

ecs.declareType("OnlineStat0", [
  ecs.compo.stat0({ name: "online0", value: { total: 0, user: 0, guest: 0 } }),  
  ecs.compo.meta({ name: "Online Stat 0", type: "OnlineStat0 " }),
], { details: "The main basic Stat over user's online presence." });

ecs.define("session0", {
  dtStart: null,
  deviceID: null,
  socketID: null
}, { details: "A basic user session." });

// core.log("ecs compo", ecs.compo);

ecs.declareType("Session0", [
  ecs.compo.session0(),
  ecs.compo.meta({ name: "User Session", type: "Session0" }),
  ecs.compo.connections({
    user: null
  })
], { details: "A basic user session." });

// ecs.define("project0", {
//   name: "",
// }, { details: "A Project" });

// ecs.define("project0status", {
//   dtRegistered: null,
//   founderID: null
// }, { details: "Tech flags about a Project" });

// ecs.define("project0members", {
//   roster: {

//   },
//   isMember: (item) => (id) => {
//     return !!item.project0members.roster[id];
//   },
//   add: (item) => (id) => {
//     if (item.project0members.isMember(id)) return false;
//     item.project0members.roster[id] = {
//       memberID: id,
//       memberName: ecs.root[id].memberCard0.name || "- No name -",
//       roles: [],
//       effects: []
//     };

//     return true;
//   }
// }, { details: "Project Members" });

// ecs.declareType("Project", [
//   ecs.compo.project0(),  
//   ecs.compo.project0status(),
//   ecs.compo.project0members(),
//   // ecs.compo.owner0({ access: 'public' }),
//   // ecs.compo.fav0(),
//   ecs.compo.meta({ type: "Project", name: "A Project" }),
//   ecs.compo.connections({
//     owner: null
//   }),
//   ecs.compo.tier({ base: "proto" }),
//   // ecs.compo.saveLocal({
//   //   self: true, type: "Project", project0: true, owner0: true, connections: true, saveLocal: true, tier: true,
//   //   fav0: true
//   // }),
//   ecs.compo.located(),
//   ecs.compo.saveFile({
//     located: true, project0: true, project0status: true, project0members: true, connections: true, tier: true
//   })
// ], { details: "Project" });

ecs.define("webApp0", {
  name: ""
}, { details: "Web App Configuration." });

ecs.declareType("WebApp0", [
  ecs.compo.webApp0(),
  ecs.compo.meta({ type: "WebApp0", name: "Web Application" }),
  ecs.compo.located(),
  ecs.compo.connections({ project: null, dev: null, prod: null }),
  ecs.compo.saveFile({ webApp0: true, located: true, connections: true, item: [ "name" ] })
], { details: "A WebApp." });

ecs.define("deployment0", {
  json: null,
  sha256: null,
  dtDeployed: null
});

ecs.declareType("Deployment0", [
  ecs.compo.deployment0(),
  ecs.compo.connections({
    project: null,
    webapp: null
  }),
  ecs.compo.located(),
  ecs.compo.meta({ name: "WebApp Content Pack", type: "Deployment0" }),
  ecs.compo.saveFile({ deployment0: true, connections: true, located: true })
]);

ecs.define("member0", {
  memberID: null, /* null for levels < 10 */
  name: "",
  status: "Default status.",
  level: 1
}, { details: "Member component for 'auth' command." });

ecs.define("ticket0", {
  ticketType: "",
  details: ""
}, { details: "Common Denominator of all Ticket0(s)" });

ecs.define("ticket0status", {
  used: false,
  dtIssued: null,
  dtUsed: null,
}, { details: "Ticket0 Status" });

ecs.declareType("TicketMemberCard0", [
  ecs.compo.ticket0({ 
    ticketType: "Member Card 0", 
    details: "Submit name, email; confirm email => Get Member Card Level 1" 
  }),
  ecs.compo.ticket0status(),
  ecs.compo.located(),
  ecs.compo.tier({ base: "poormans" }),
  ecs.compo.connections({
    project: null,
    event: null,
    owner: null
  }),
  ecs.compo.saveFile({
    located: true, ticket0: true, ticket0status: true, connections: true, tier: true
  }),
]);

module.exports.runAsync = async() => {
  
};