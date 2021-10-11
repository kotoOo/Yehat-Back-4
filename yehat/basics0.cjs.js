'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var ecs$1 = require('./ecs.cjs.js');
const ecs = ecs$1.ecs;

// const define = ecs$1.ecs.define;

const Pause = ecs.define("pause", {
  dtStart: null,
  dtEnd: null,
  duration: 0
}, { details: "A pause sub-component stored inside a [Timer]." });

const Timer = ecs.define("timer", {
  state: 0, /* 1 running 2 pause 3 stopped */
  dtStart: null,
  dtPause: null,
  dtEnd: null,
  pauses: [],
  interval: 40,
  t: null,
  elapsedCom: null,
  payload: null,
  once: [],
  tick: (item) => () => {
    if (item.timer.state == 1) {
      item.timer.elapsedCom = item.timer.elapsed();
    }

    if (item.timer.payload && (typeof item.timer.payload == "function")) {
      item.timer.payload({ now: performance.now() });
    }

    item.timer.once.map((request, index) => {
      const { at, fn } = request;
      if (item.timer.elapsedCom >= at) {
        fn({ timer: item.timer });
        item.timer.once.splice(index, 1);
      }
    });

    if (item.timer.state == 1) {
      item.timer.t = setTimeout(item.timer.tick, item.timer.interval);
      // console.log(`[${item.meta.name}][Timer]Extended`);
    }
  },
  start: (item) => ({ now = +new Date() } = {}) => {
    // console.log("Timers are disabled.");
    if (item.timer.t) {
      console.log("[Timer]Timer already running.");
      return;
    }
    item.timer.dtStart = now;
    item.timer.dtEnd = null;
    item.timer.pauses = [];
    item.timer.state = 1;

    item.timer.t = setTimeout(item.timer.tick, item.timer.interval);
    console.log(`[${item.meta.name}][Timer]Started`);
  },
  pause: (item) => () => {
    if (item.timer.state != 1) {
      console.log("[Timer]Cannot pause, timer is not ruunning.");
      return;
    }

    item.timer.state = 2;
    const now = +new Date();
    item.timer.pauses.push(
      new Pause({ dtStart: now }).pause
    );
    item.timer.elapsedCom = item.timer.elapsed({ now });
  },
  resume: (item) => () => {
    if (item.timer.state != 2 || !item.timer.pauses.length) {
      console.log("[Timer]Cannot resume, not paused.");
      return;
    }

    const pause = item.timer.pauses[item.timer.pauses.length-1];
    const now = +new Date();
    pause.dtEnd = now;
    pause.duration = pause.dtEnd - pause.dtStart;

    item.timer.state = 1;
    item.timer.elapsedCom = item.timer.elapsed({ now });
  },
  stop: (item) => ({ now = +new Date() } = {}) => {
    console.log("[Timer]Timer stopped.", item.timer.t);
    if (item.timer.t) {
      clearTimeout(item.timer.t);
      item.timer.t = null;
    }

    if (item.timer.state == 2) {
      const pause = item.timer.pauses[item.timer.pauses.length-1];
      pause.dtEnd = now;
      pause.duration = pause.dtEnd - pause.dtStart;
    }
    
    item.timer.dtEnd = now;
    item.timer.elapsedCom = item.timer.elapsed({ now });
    item.timer.state = 3;
  },
  elapsed: (item) => ({ now = +new Date() } = {}) => {
    const pausedTime = item.timer.pauses.reduce((a, v) => {
      const interval = v.dtEnd === null ? ((item.timer.dtEnd || now) - v.dtStart) : (v.dtEnd - v.dtStart);
      return a + interval;
    }, 0);

    return (item.timer.dtEnd || now) - item.timer.dtStart - pausedTime;
  } 
}, {
  details: `Robust [Timer] core featuring full cycle timer operations: "start", "stop", "pause", "resume", as well as
  "elapsed" time computation enchantment.
  state -- Enum [ 0: Idle, 1: Running, 2: Paused, 3: Stopped ]
  dtStart, dtPause: null, dtEnd: null -- recent timestamps
  pauses -- Array of Pause
  interval -- Interval in milliseconds
  t -- JS Timer instance
  elapsedCom -- reactively updated elapsed time
  payload -- a function to call on every tick`
});

const useLoader = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections({
      
    }),
    Item({
      baseComponent: "ILoader"
    }),    
    Meta({
      type: "Loader",
      name: "Loader"
    }),
    Timer()
  ])({ id });
};

const Cargo = ecs.define("cargo", {
  cursor: null
}, { details: `Memory Cell for [Cargo]. "cursor" is index of a stored item to show.` });

const useCargo = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "ICargo"
    }),
    Meta({
      type: "Cargo",
      name: "Info Panel"
    }),
    Cargo() 
  ])({ id });
};

const Story = ecs.define("story", {
  frames: [], /* StoryFrame */
  stage: 0,
  done: false,
  duration: null
});

const StoryFrame = ecs.define("storyFrame", {
  caption: "- No caption -",
  done: false,
  dtDone: null,
  dtStart: null,
  duration: null
});

const useStory0 = ({ id, rel }) => { 
  return loadItem([   
    Located({
      rel,
      pos: [ 20, 0, 0 ],
      size: [ 20, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "IStory0"
    }),
    Meta({
      type: "Questline",
      name: "ToDo"
    }),
    Story({
      frames: [
        StoryFrame({
          caption: "Try panning the camera.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Try dragging an object.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Drop stuff to the Cargo.",
          done: false
        }).storyFrame,
        StoryFrame({
          caption: "Drop more stuff to the Cargo.",
          done: false
        }).storyFrame
      ]
    }),
    Timer()
  ])({ id });
};

const NavConfig = ecs.define('config', {
  showJSON: false
});

const useNavigation0 = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 10, 0, 0 ],
      size: [ 10, 15 ]
    }),
    Connections([

    ]),
    Item({
      baseComponent: "INavigation"
    }),
    NavConfig({
      showJSON: false
    }),
    Meta({
      type: "NavDash",
      name: "Info Dash"
    })
  ])({ id });
};

const EntityEditConfig = ecs.define('entEditConf0', {
  // showJSON: false
  compoCursor: 0,
  compoEditing: null,
  showSlot: false,
  showEntityScheme: true
}, { details: `Memory Cell for [Entity Editor]. "compoCursor" is a currently active component index within 
an Entity being browsed.` });

const useEntityEdit = ({ id, rel }) => { 
  return loadItem([
    Located({
      rel,
      pos: [ 0, 15, 0 ],
      size: [ 40, 25 ]
    }),
    Connections({
      target: null
    }),
    Item({
      baseComponent: "IEntityEdit"
    }),
    EntityEditConfig(),
    Meta({
      type: "Entity Editor",
      name: "Entity Editor"
    }),
    SaveLocal({
      connections: true,
      entEditConf0: true
    })
  ])({ id });
};

ecs.define("user2", {
  eventID: null, /* What event led to creating this user2 record. */
                 /* Ex.: Presentation 0 [704539de-5b73-4f3f-8e72-f78755c14b1c] */
  refID: null, /* Owner of the invitational code, an arbitrary UUID - user0, user1, user2 - any */
  name: "Unknown",
  deviceIDs: []
});

const makeUser2 = ({ id, user2, ...a }) => {
  const entity = ecs.loadEntity([
    ecs.compo.user2(user2),
    ecs.compo.meta({
      type: "User2",
      name: "Promotion-Aquired User"
    }),
    ecs.compo.saveRemote({
      user2: true
    })
    // ecs.compo.saveLocal({
    //   session0: true,
    //   timer0: true
    // })
  ])({ id });

  return entity;
};

ecs.declareType("User2", makeUser2, { details: "Promotion-Aquired User" });

/* EP0 - Entity Protocol Zero, a factory supply some Entities to you if you pass ECS environment,
currently <s>Entity constructor</s> plus component base. */
/* --[ Lvl 3 ] -------------------------------------------------- */

const Meta = ecs$1.define('meta', {
  type: "Unknown",
  name: "No name",
  tags: []
}, { details: `General meta-information about an Entity, such its "type" (archetype, classification of the Entity Class 
  amongst other Entity Classes), and its "name" (Entity Class name, arbitrary).` });

const Located = ecs.define('located', {
  rel: null,
  pos: [ 0, 0, 0 ],
  size: [ 0, 0 ]
}, { details: `Entity's parent container ID and Vector3 position inside of it.` });

const Connections = ecs$1.define('connections', {
  initConnections: (item) => {
    if (!item.connections.passive) item.c = vue.computed(() => {
      core.log("[Connections]Recomputing connections", item.meta ? item.meta.name : item.type, Object.keys(item.connections).length);
      const a = {};
      for(let key in item.connections) {
        if (key === "passive") continue;
        a[key] = ecs$1.ecs.root[item.connections[key]];
      }

      // return Object.keys(item.connections).map(key => ecs.root[item.connections[key]]);

      return a;
    });

    return undefined;
  }
}, { details: `Keys are "handles", or "slot names", values are entity IDs. Mentioned Entities will be reactively
mapped to "c" property of [this].` });

const Item = ecs$1.define('item', {
  baseComponent: "IAbstract",
  cargoStyle: null,
  style: null,
  show: false,
  opened: false,
  baseIcon: null,
  baseImage: null,
  name: '' /* Many types are difficult to be visualized if they're not consistent where they store names */
}, { details: `Makes entity renderable on ZII Table3.` });

const Drag = ecs$1.define('drag', {
  active: false,
  pos: [ 0, 0 ],
  onDrop: (item) => () => {}
}, { details: `Keep information about how an Entity is being dragged.` });

const Activity = ecs$1.define("activity", {
  dtLastTouched: null,
  count: 0,
  z: 0
}, { details: `Used to track activity of ZII Table 3 items, namely for maintain their z-order.`, tags: [ "zt3" ] });

const SaveLocal = ecs$1.define("saveLocal", {
  /* ... DYNAMIC Key: component name, Value: True = save all fields, Array = save some fields */
  save: (item) => ({ prefix = "yehat1" } = {}) => {
    const a = {};
    let saveSelf = false;
    for (let key in item.saveLocal) {
      let v = item.saveLocal[key];

      if (key == "self" && v) {
        saveSelf = true;
      }

      if (key == "forceUpgrade") continue;

      if (Array.isArray(v)) {
        a[key] = {};
        v.forEach(name => a[key][name] = item[key][name]);
      } else if (v === true) {
        a[key] = item[key];
      }
    }

    if (saveSelf) {
      const roster = JSON.parse(localStorage[`${ecs$1.ecs.prefix}-local-roster`] || '{}');
      roster[item.id] = item.meta.type;
      localStorage[`${ecs$1.ecs.prefix}-local-roster`] = JSON.stringify(roster);
      console.log(`[ECS]Saved Local Instance ${item.meta.name}.`);
    } else {
      console.log(`[ECS]Saved locally ${item.meta.name}.`);
    }

    localStorage[`${prefix}-${item.id}`] = JSON.stringify(a);    
  }
}, { details: `Declares some components of an Entity to be saved in Local Storage. Keys are component names, values are:
true - store all the component OR Array of Strings - store given keys only.` });

const SaveRemote = ecs$1.ecs.define("saveRemote", {
  /* ... DYNAMIC Key: component name, Value: True = save all fields, Array = save some fields */
  type: "Unknown",
  save: (item) => () => {
    console.trace("SaveRemote");
    const a = { id: item.id };
    for (let key in item.saveRemote) {
      let v = item.saveRemote[key];

      if (Array.isArray(v)) {
        a[key] = {};
        v.forEach(name => a[key][name] = item[key][name]);
      } else if (v === true) {
        a[key] = item[key];
      } else if (typeof v == "function") ; else if (typeof v == "string") {
        a[key] = v; /* Just a string value, 1st suggestion: type */
      }
    }

    core.yehat.outbound.push({
      cmd: "ecs.save",
      entity: a,
      ack: ({ code, details }) => {
        if (code == "ok") {
          console.log("[ECS]Saved Remote Instance", item.meta.name);
        } else {
          console.log("[ECS]Saving Remote Instance Error", details);
        }
      }
    });

    if (core.socket && core.socket.connected) {
      core.yehat.transmitOutbound({ socket: core.socket });
    } else {
      console.log("[ECS]IO not connected, messages in the outbound queue: ", core.yehat.outbound.length, core.yehat.outbound);
    }
  }
}, { });

const loadItem = (a = []) => ecs$1.loadEntity([ /* Looks like just a helper for generating ZII Table 3 
                                                    uniformly-looking entities. That's why it is here, and not in
                                                    ecs.js. It is a domain-specific stuff. */
  Located(),
  Item(),
  Drag(),
  Activity(),
  SaveLocal({
    located: true
  }),  
  ...a
]);

ecs$1.ecs.declareCompoSet("AbstractItem", [
  Located(),
  Item(),
  Drag(),
  Activity(),
  SaveLocal({
    located: true
  })
], { details: "Mix it in to add all Item components: Located, Item, Drag, Activity, SaveLocal = { located: true }" });

// ecs.define("tags", [], { details: "Entity Tags." });
// console.log("ecs.type.AbstractItem", ecs$1.ecs.types.AbstractItem);

ecs$1.ecs.define("we", {
  solid: false,
  portPickRequested: false
}, { details: "World Entity." });

ecs$1.ecs.define("fav0", {
  fav: false
}, { details: "A Local Fav Mark" });

ecs$1.ecs.define("dialog0", {
  show: false
}, { details: "State for the items which are dialogs =^_^=" });

ecs$1.ecs.define("tier", {
  base: "proto" /* Base Tier: enum | proto monkeys poormans standard premium epic legend | */
});

exports.Activity = Activity;
exports.Connections = Connections;
exports.Drag = Drag;
exports.Item = Item;
exports.Located = Located;
exports.Meta = Meta;
exports.SaveLocal = SaveLocal;
exports.SaveRemote = SaveRemote;
exports.loadItem = loadItem;
exports.makeUser2 = makeUser2;
exports.useCargo = useCargo;
exports.useEntityEdit = useEntityEdit;
exports.useLoader = useLoader;
exports.useNavigation0 = useNavigation0;
exports.useStory0 = useStory0;
