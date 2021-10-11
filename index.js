#!/usr/bin/env node

const serverID = "W3rCkHzCtcKQRU_CkBnCjc";
/* "eGHCmjvDrcKAR8O9woYbT1" <-- yehat back 3 */
/* "475316bd-47f9-477b-b2ff-b803b7cf6885" at box !! ToDo!! */
const epochStart = 18761;

const  logging = { root: false, compo: false };
 
const core = {
  // config: {
  //   wsPort: 4950
  // },
  capitalize: s => s.charAt(0).toUpperCase() + s.slice(1),
  microTime: () => new Date().getTime(),
  time: () => Math.floor(new Date().getTime() / 1000),
  to2Digits: (v) => {
    let a = "" + v;
    if (a.length < 2) a = '0'+a;
    return a;
  },
  to3Digits: (v) => {
    let a = "" + v;
    while (a.length < 3) a = '0'+a;
    return a;
  },
  dtToVTime: (dt, short = false) => {
    const ms = dt % 1000;
    const a1 = Math.floor(dt / 1000);
    const s = a1 % 60;
    const a2 = Math.floor(a1 / 60);
    const m = a2 % 60;
    const a3 = Math.floor(a2 / 60);
    const h = a3 % 24;
    const a4 = Math.floor(a3 / 24);
    const d = a4 / 10;
    if (short) return `${core.to2Digits(h)}:${core.to2Digits(m)}:${core.to2Digits(s)}.${core.to3Digits(ms)}`;
    return `Day ${a4 - epochStart} Time ${core.to2Digits(h)}:${core.to2Digits(m)}:${core.to2Digits(s)}.${core.to3Digits(ms)}`;
  },
  dtStart: null, /* Moment of Yehat System started. */
  vTimeNow: () => core.dtToVTime(core.microTime()),
  vTimeSession: () => core.dtToVTime(core.microTime() - core.dtStart, true),
  log: (...rest) => console.log(...rest),
  makeLog: (name, trace = false) => (...rest) => 
    (trace ? console.trace : console.log)
    ("\x1b[37m--[\x1b[33m %s \x1b[37m]--[ %s ]--[ "+"%s ".repeat(Object.keys(rest).length), name, core.vTimeSession(), ...rest),
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }),
  slug: require("./libs/slugid").nice,
  validateEmail: email => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  escapeHTML: (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);
  },
  dec: b=>{let a={},e={},d=b.split(""),c=d[0],f=c,g=[c],h=256,o=h;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[
    a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")},
  enc: c=>{let x='charCodeAt',b={},z={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=z[a+c]?a+=c:(d.
    push(1<a.length?z[a]:a[x](0)),z[a+c]=g,g++,a=c);d.push(1<a.length?z[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=
    String.fromCharCode(d[b]);return d.join("")},
  decJ(s) {
    return JSON.parse(this.dec(s));
  },
  encJ(o) {
    return this.enc(JSON.stringify(o))
  },
  ...((() => {
    const randomString = r => n => () => new Uint8Array(n).reduce((a, v) => a + Math.floor(Math.random() * r).toString(r), "");
    return {
      randomString,
      randomHex8: randomString(16)(8),
      randomHex20: randomString(16)(20),
    }
  })()),
  ms: delay => new Promise(resolve => setTimeout(resolve, delay)),
  dropper: (drop = []) => v => {
    const a = Object.assign({}, v);
    drop.forEach(key => delete a[key]);
    return a;
  },    
  panic: [],
  mods: {},
  serverID
};

global.core = core;

// core.log(core.time());

core.dtStart = core.microTime();
core.log("\x1b[35m--[\x1d[04m Yehat Badkend \x1b[m\x1b[35m]--[ %s ]--[ %s\x1b[m", core.vTimeNow(), "Initializing server...");

const log = core.makeLog("Yehat Backend");

require("./yehat/pure.js");

const { ecs } = require("./yehat/ecs.cjs.js");
core.ecs = ecs;
global.ecs = ecs;

const source = require("./yehat/source0.js");
ecs.bootSource(source);
ecs.unbox(require("./sources/10-MessageBases.json").roster);

(async () => {
  const files = require('fs').readdirSync(__dirname + '/boot');
  for(let file of files) {
    if (file.match(/\.js$/) === null) continue;

    // let name = file.replace('.js', '');
    let mod = require('./boot/' + file);
    if (mod.runAsync) {
      await mod.runAsync();
    }
  }

  core.log0({ deviceID: serverID, name: "yehat-backend-start", message: "Ye-haat. Reporting in. Server is starting now." });
  
  log("ECS Root", Object.keys(ecs.root).length, "Compo", Object.keys(ecs.compo).length);
  if (logging.root) console.table(Object.values(ecs.root).map(v => {
    const { id, type, ...rest } = v;
    return {
      id, type, components: Object.keys(rest).join(" ")
    };
  }));
  log("------");
  if (logging.compo) console.table(ecs.compo);

})();

