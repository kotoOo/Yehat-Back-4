#!/usr/bin/env node
console.log("YEHAT BACK 4");

const vue = global.vue = require("vue");

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
  lastLogDT: process.hrtime(),
  logTick: () => {
    const now = process.hrtime();
    const ms = [ now[0] - core.lastLogDT[0], now[1] - core.lastLogDT[1] ];
    core.lastLogDT = now;
    return `[${String(ms[0]).padStart(5)}.${String(ms[1] < 0 ? ms[1] + 1000000000 : ms[1]).padStart(9)}]`;
  },
  log: (...rest) => {    
    console.log(core.logTick(), ...rest);
  },
  makeLog: (name, trace = false) => (...rest) => {
    const now = process.hrtime();
    const ms = [ now[0] - core.lastLogDT[0], now[1] - core.lastLogDT[1] ];
    core.lastLogDT = now;
    
    console.log(core.logTick(), `[${name}]`, ...rest);
  },
    // (trace ? console.trace : console.log)
    // ("\x1b[37m--[\x1b[33m %s \x1b[37m]--[ %s ]--[ "+"%s ".repeat(Object.keys(rest).length), name, core.vTimeSession(), ...rest),
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

/* Blessed Initialization */
// # ! /usr/bin/env node

/**
 * multiplex.js
 * https://github.com/chjj/blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey (MIT License)
 * A terminal multiplexer created by blessed.
 */

const path = require("path");
var blessed = require('blessed');


const origOut = {
  stdout: process.stdout.write
};

const screen = blessed.screen({
  smartCSR: true,
  // log: path.join(__dirname, '/blessed-terminal.log'),
  fullUnicode: true,
  dockBorders: true,
  ignoreDockContrast: true
});

core.screen = screen;

console.log("Screen");

const util = require("util");
function stringify(value) {
  switch (typeof value) {
    case 'string': return value;
    case 'object': return util.inspect(value, false, 3, true);
    default: return String(value);
  }
};

// var Janeway = global.Janeway = require('janeway');
// Janeway.start({ screen, height: "50%" }, () => {
 //  process.title = 'multiplex.js';

  
  
  
  // screen = Janeway.screen;

  

  var topleft = blessed.box({
    parent: screen,
    cursor: 'line',
    cursorBlink: true,
    screenKeys: false,
    scrollable: true,
    left: 0,
    top: 0,
    width: '100%',
    height: '50%',
    border: 'line',
    style: {
      fg: 'default',
      bg: 'default',
      focus: {
        border: {
          fg: 'green'
        }
      },
      
    },
    /* alwaysScroll: true, */
    keys: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
  });

  var replBox = blessed.box({
    parent: screen,
    scrollable: true,
    left: 0,
    top: '50%-1',
    width: '50%',
    height: '50%',    
    label: "REPL Output",
    border: 'line',
    style: {
      border: {
        fg: 'blue'
      }
    },
    keys: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
  });

  var replForm = blessed.form({
    parent: screen,
    label: 'REPL>',
    left: 0,
    top: '100%-1',
    width: '100%',
    height: 1,
    mouse: true
  });

  const replPrint = (type, args, options) => {
    var i,
        info,
        level,
        trace,
        result,
        output;
  
    if (!options) {
      options = {};
    }
  
    // if (typeof options.verbosity == 'undefined') {
    //   options.verbosity = this.LEVELS.INFO;
    // }
  
    level = options.level || 0;
  
    if (options.err) {
      level -= 3;
    }
  
    
    
    options.info = { time: new Date() };    
  
    // if (this.logList) {
    //   result = this.logList.consoleLog(args, type, options);
    // }
  
    
      trace = esc(90, '[') + type + esc(90, '] '); // + esc(90, '[') + /*esc(1, info.file + ':' + info.line)*/ + esc(90, '] ');
      output = trace;
  

      i = 0;

  
      for (; i < args.length; i++) {
  
        if (args[i] && typeof args[i] != 'string') {
          args[i] = util.inspect(args[i], { colors: true, depth: 1, breakLength: 80, compact: true, showHidden: false });
        }
  
        output += ' ';
  
        // if (typeof args[i] != 'string') {
        //   output += util.inspect(args[i], {colors: true});
        // } else {
          output += args[i];
        // }
      }
  
      // Remove colours when terminal doesn't support them
      // if (!process.env.COLORTERM && !this.options.keep_color) {
      //   output = stripEsc(output);
      // }
  
      replBox.pushLine(output);
      replBox.setScrollPerc(100);
      // write('\n');
    
  
    return result;
  };

  var replInput = blessed.textbox({
    parent: replForm,
    inputOnFocus: true,
    width: '100%',
    height: 1,
    top: 0,
    left: 10,
    height: 1,
    name: 'command',
    input: true,
    mouse: true,
    style: {
      bg: "blue",
      fg: "yellow"
    }
  });

  replInput.on("keypress", (key, a) => {
    if (a.full === 'C-q') {
      process.exit();
      return;
    }

    if (a.full === 'up' && ecs.root.cmdLine) {
      ecs.root.cmdLine.cmdLine1.up();      
      replInput.setValue(ecs.root.cmdLine.cmdLine1.command);

      //process.nextTick(() => {
      screen.render();
      //});
      return;
    }

    if (a.full === 'down' && ecs.root.cmdLine) {
      ecs.root.cmdLine.cmdLine1.down();
      replInput.setValue(ecs.root.cmdLine.cmdLine1.command);
      //process.nextTick(() => {        
      screen.render();
      //});
      return;
    }

    if (a.full === 'left') {
      screen.program.left();
      return;
    }

    if (a.full === 'right') {
      screen.program.right();
      return;
    }

    console.log("keypress", key, a);

    process.nextTick(() => {
      if (ecs.root.cmdLine) {
        ecs.root.cmdLine.cmdLine1.command = replInput.value;
      } else {
        console.log("[REPL]Command:", replInput.value);
      }
    });
  });

  core.replInput = replInput;

  replInput.on("submit", (s) => {
    if (ecs.root.cmdLine) {
      ecs.root.cmdLine.cmdLine1.enter();
    }

    try {
      const result = (new Function(`return (${s});`))();
      replPrint("OK>", [ result ]);     
    } catch(e) {
      replPrint("!!>", [ e.message ]);
    }

    replInput.clearValue();
    replInput.focus();
  });

  var mainmenu = blessed.box({
    parent: screen,
    scrollable: true,
    cursor: 'block',
    screenKeys: false,
    label: 'Main Log',
    left: 12,
    top: 1,
    width: '50%',
    height: '50%',
    border: 'line',
    style: {
      fg: 'white',
      bg: 'black',
      focus: {
        border: {
          fg: 'green'
        }
      }
    },
    keys: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
    hidden: true
  });

  var btnMenu = blessed.button({
    parent    : mainmenu,
		mouse     : true,
		autoFocus : false,
		name      : 'shutdown',
		content   : 'Shutdown (Control-Q)',
		padding   : {
			left  : 1,
			right : 1
		},
    style: {
      bg: "green"
    },
    height: 1,
    top: 1
  });

  btnMenu.on('click', () => {
    process.exit();
  });

  var btnKB = blessed.button({
    parent    : mainmenu,
		mouse     : true,
		autoFocus : false,
		name      : 'knowledgebase',
		content   : 'Knowledgebase',
		padding   : {
			left  : 1,
			right : 1
		},
    style: {
      bg: "green"
    },
    height: 1    
  });

  btnKB.on('click', () => {
    core.log('[Components]', ecs.compopedia);
    core.log('[Types]', ecs.typeopedia);    

    mainmenu.hidden = true;
  });



  global.mainmenu = mainmenu;

  

  // const toScreen = (...a) => {
  //   topright.pushLine(a.map(stringify).join(' '));
  //   topright.setScrollPerc(100);
  //   screen.render();
  // };

  // var bottomLeft = 

  // var bottomleft = blessed.terminal({
  //   parent: screen,
  //   cursor: 'block',
  //   cursorBlink: true,
  //   screenKeys: false,
  //   label: ' multiplex.js ',
  //   left: 0,
  //   top: '50%-1',
  //   width: '50%',
  //   height: '50%+1',
  //   border: 'line',
  //   style: {
  //     fg: 'default',
  //     bg: 'default',
  //     focus: {
  //       border: {
  //         fg: 'green'
  //       }
  //     }
  //   }
  // });

  console.log("before bottomright");

  const XTerm    = require("blessed-xterm")

  var bottomright = new XTerm({
    shell:         process.env.SHELL || "sh",
    args:          [],
    env:           process.env,
    cwd:           process.cwd(),
    cursorType:    "block",
    // controlKey:    "none",
    scrollback:    2000,
    tags: true,
    border:        "line",

    style: {
        fg:        "default",
        bg:        "default",
        border:    { fg: "default" },
        focus:     { border: { fg: "green" } },
        scrolling: { border: { fg: "green" } },
        scrollbar: {
          ch: ' ',
          inverse: true
        },
    },
    left:    Math.floor(screen.width / 2),
    top:     Math.floor(screen.height / 2),
    width:   Math.floor(screen.width / 2),
    height:  Math.floor(screen.height / 2),
    label:   "Sample XTerm #2",
    // keys: true,
    mouse: true,
    scrollbar: {
      ch: ' ',
      inverse: true
    },
    // scrollable: true,
    // mouse: true,
    // mousePassthrough: true
  });

  screen.append(bottomright);
  // bottomright.enableMouse();

  // bottomright.on("scrolling-start", () => {      
  //   screen.render();
  // })
  // bottomright.on("scrolling-end", () => {
  //   screen.render();
  // });
  // bottomright.on("scroll", (a, b, c) => {
  //   console.log("scroll", a, b, c)
  //   screen.render();
  // });

  bottomright.on("mouse", (a, b, c) => {
    //console.log("mouse", a, b, c)
    if (a.action === 'wheelup') {
      bottomright.scroll(-1);
      // bottomright.scrolling = false;
      // screen.render();
    } else if (a.action === 'wheeldown') {
      bottomright.scroll(1);
      // bottomright.scrolling = false;
      // screen.render();
    }
  });

  //bottomright.scrollabe = true;
  // bottomright.pty.on('data', function(data) {
  //   // screen.log(JSON.stringify(data));
  // });

  // bottomright.on('scroll', (a, b, c) => {
  //   console.log("scroll", a, b, c);
  // })

  core.term0 = bottomright;

  

  // const toErr = (...a) => {
  //   bottomright.pushLine(a.map(stringify).join(' '));
  //   screen.render();
  // };

  [/* topleft,*//* topright,*/ /*bottomleft, */ bottomright].forEach(function(term) {
    // term.enableDrag(function(mouse) {
    //   return !!mouse.ctrl;
    // });
    // term.on('title', function(title) {
    //   screen.title = title;
    //   term.setLabel(' ' + title + ' ');
    //   screen.render();
    // });
    term.on('click', () => {
      // replInput.blur();
      term.focus.bind(term);      
    });
  });

  // // topleft.focus();

  console.log("after bottomright");

  screen.key('C-q', function() {
    // topleft.kill();
    // topright.kill();
    // bottomleft.kill();
    bottomright.kill();
    return screen.destroy();
  });

  screen.program.key('S-tab', function() {
    screen.focusNext();
    screen.render();
  });

  


  

  // const _log = console.log;
  // const _err = console.error;
  // const _table = console.table;
  // console.log = toScreen;
  // console.error = toErr;
  // console.table = () => {};


  const that = topleft;

  function esc(code, str, endcode) {

    var result = '\u001b[' + code + 'm';
  
    if (typeof str !== 'undefined') {
  
      if (typeof endcode === 'undefined') {
        endcode = 0;
      }
  
      result += str + esc(endcode);
    }
  
    return result;
  }

  // const Blast = require('protoblast')(false);

  that.print = (type, args, options) => {
    var i,
        info,
        level,
        trace,
        result,
        output;
  
    if (!options) {
      options = {};
    }
  
    // if (typeof options.verbosity == 'undefined') {
    //   options.verbosity = this.LEVELS.INFO;
    // }
  
    level = options.level || 0;
  
    if (options.err) {
      level -= 3;
    }
  
    
    
    options.info = { time: new Date() };    
  
    // if (this.logList) {
    //   result = this.logList.consoleLog(args, type, options);
    // }
  
    
      trace = esc(90, '[') + type + esc(90, '] ');
      output = trace;
  
      
      i = 0;
      // }
  
      for (; i < args.length; i++) {
  
        if (args[i] && typeof args[i] != 'string') {
          args[i] = util.inspect(args[i], { colors: true });
        }
  
        output += ' ';
  
        // if (typeof args[i] != 'string') {
        //   output += util.inspect(args[i], { colors: true });
        // } else {
          output += args[i];
        // }
      }
  
      // Remove colours when terminal doesn't support them
      // if (!process.env.COLORTERM && !this.options.keep_color) {
      //   output = stripEsc(output);
      // }
  
      topleft.pushLine(output);
      topleft.setScrollPerc(100);
      screen.render();
      // write('\n');
    
  
    return result;
  };

  

	console._log = console.log;
	console.log = function log(...a) {
		that.print('info', a, {level: 1});
	};
	console.dir = function dir(...a) {
		that.print('dir', a, {level: 1});
	};
	console.info = function info(...a) {
		that.print('info', a, {level: 1});
	};
	console.warn = function warn(...a) {
		that.print('warn', a, {level: 1});
	};
	// console.error = function error(...a) {
	// 	that.print('error', a, {level: 1});
	// };

  console.log("before 1st render");
  screen.render();


	// process.stderr.write = function stderrWrite(string, encoding, fd) {
	// 	that.print('error', [''+string]);
	// };

	// process.stdout.write = function stdoutWrite(string, encoding, fd) {
	// 	that.print('info', [''+string]);
	// };

	process.stdout.on('resize', function onResize() {
		console.log("resize", process.stdout.columns, process.stdout.rows);
	});


/* --- */

core.dtStart = core.microTime();
core.log("\x1b[35m--[\x1d[04m Yehat Badkend \x1b[m\x1b[35m]--[ %s ]--[ %s\x1b[m", core.vTimeNow(), "Initializing server...");

const log = core.makeLog("Yehat Backend");

require("./yehat/pure.js");

const { ecs } = require("./yehat/ecs.cjs.js");
core.ecs = ecs;
global.ecs = ecs;



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

  // var indicator = Janeway.addIndicator({icon: '{red-fg}◉{/red-fg}'});

  // // Change the icon
  // indicator.setIcon('○');

  // // Set a hover text
  // indicator.setHover('Booting MODs finished.');

  // indicator.on('click', () => console.log("Clicked."));

  // var my_menu = Janeway.addIndicator({ icon: 'Yehat Back 4', type: "System", weight: 1 });

  // my_menu.addItem('Shutdown', function onClick(e, config) {
  //     process.exit();
  // });

  var btnMenu = blessed.button({
    parent    : screen,
		mouse     : true,
		autoFocus : false,
		name      : 'mainmenu',
		content   : 'Yehat Back 4',
		shrink    : true,
		padding   : {
			left  : 1,
			right : 1
		},
    left: 15,
    top: 0
  });

  btnMenu.on('press', function() {
    console.log("Test Button clicked.");

    mainmenu.hidden = !mainmenu.hidden;
    screen.render();
  });


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

  core.startESW = (federation = 'ongoing') => {
    log(`[ESW ${federation}] <[start]`);
    const { spawn } = require('child_process');

    const child = spawn('node', [ `./yehat/federations/${federation}/esw.js` ], { cwd: '/mnt/c/yehat/sunlight0/' });

    child.stdout.on('data', (data) => {
      core.log(`[ESW ${federation}] []> ${data}`);
    });

    child.stderr.on('data', (data) => {
      core.log(`[ESW ${federation}] [!]> ${data}`);
    });

    child.on('error', (error) => {
      core.log(`[ESW ${federation}] [!!]> ${error.message}`);
    });

    child.on('close', (code) => {
      core.log(`[ESW ${federation}] [closed]>`, code);
    });

    log(`[ESW ${federation}] <[start] []> [ok]`);

    core.eswProcess = child;
  };  
})();

// });