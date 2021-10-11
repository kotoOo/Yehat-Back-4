'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// const { setFlagsFromString } = require('v8');
const vue = require('vue');
const { reactive, computed } = vue; 
const log = core.makeLog("ECS");

// import { extend } from "quasar";


/* The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS */
// export const Entity = (a = {}) => reactive({
//   id: core.uuid(),
//   ...a
// });
/* --[ Lvl 3 ] -------------------------------------------------- */
/* Upgraded to Lvl 4 */

const logging = {
  loading: 0,
  loadingVerbose: 0, 
  bindMethods: 0,
  enchanting: 0,
  enchantingVerbose: 0
};

const Entity1 = (a = []) => {
  let b = {};
  for(let key in a) {
    let component = a[key];
    if (Object.keys(component) == 1) {
      let name = Object.keys(component)[0];
      b[name] = component[name];
    } else {
      b = { ...b, ...component }; /* wrong, components are not only objects */
    }
  }

  return vue.reactive({
    id: core.uuid(),
    ...b
  });
};

const isNode = typeof module !== 'undefined' && !!module.exports;


const loadEntity = (a = []) => async ({ id, prefix = "yhtback0", /* methods = {}, */ exclude = [], ...rest }) => {
  /* For what is it needed? Why don't we use just the super-simple Entity LVL 1 constructor? 
    After the first call it creates one-call button that will:
      - load your stuff from the localStorage (yes, we're domain-leaning already what to do?);
      - cleanup keys that are stated in `saveLocal.forceUpgrade` field, if any;
      - hydrate the initial Entity Form passed at the first call with the loaded data;
        that will effectively cut off all the stuff that might be present in your input
        (localStorage at the moment, but where it comes from to localStorage, we ain't limit!
        And, btw, it might be present there thanks to another and future versions of ZII ECS,
        so, we are loading only what we're expecting)
      - run bindMethods that will bind all functions that are present in the input, assuming
        them to be [ZII ECS Standard Component Method 0] HLFs.
    
    Whenever we need to lean away from these, we may create Entities in any other manner.

    IT DOES PIPE IN THE FRESH ENTITY INTO ecs.root!
  */
  const b = { id };
  let initial;
  let d = 0;

  if (isNode) { /* Currently prefix is ignored for file operations */
    const saveFileCompo = a.find(compo => !!compo.saveFile);
    const saveFile = saveFileCompo ? saveFileCompo.saveFile : null;

    const locatedCompo = a.find(compo => !!compo.located);
    const located = rest.located ? rest.located.rel : (
      locatedCompo ? locatedCompo.located.rel : null
    );

    if (logging.loading) core.log(`[ECS loadEntity ${id} :type ${rest.type ? rest.type : 'Unknown' }]`);

    const filename = located ? `./file-db/${located}/${id}.json` : `./file-db/${id}.json`;

    let stored;
    try {
      stored = JSON.parse(
        await new Promise((resolve) => {
          require("fs/promises").readFile(filename)
            .then(file => resolve(file))
            .catch(e => {
              core.log(`[ECS]No file-db entry for ${id}, the instance is fresh.`);
              resolve(null);
            });
        }) || "{}"
      );
    } catch(e) {
      console.log("Error in file", filename, e.message);
      throw(e);
    } 

    /* Removing keys, which are to be upgraded. */
    if (saveFile && saveFile.forceUpgrade) { 
      for(let key in stored) {
        if (~saveFile.forceUpgrade.indexOf(key)) {
          delete stored[key];
          d++;
        }
      }
    }
      
    initial = { ...rest, ...stored };
  } else {
    const saveLocalCompo = a.find(compo => !!compo.saveLocal);
    const saveLocal = saveLocalCompo ? saveLocalCompo.saveLocal : null;

    let initial;
    let d = 0;

    if (saveLocal && saveLocal.forceUpgrade) {
      const stored = JSON.parse(localStorage[`${prefix || ecs.prefix}-${id}`] || "{}");
      
      for(let key in stored) {
        if (~saveLocal.forceUpgrade.indexOf(key)) {
          delete stored[key];
          d++;
        }
      }
      
      initial = { ...rest, ...stored };
    } else {
      initial = { ...rest, ...JSON.parse(localStorage[`${prefix || ecs.prefix}-${id}`] || "{}") };
    }
  }

  /* CASE 1 => Known entity type. Saving only according to defined structure */

  /* Populating b with "initial" data, which is actually our INPUT, overwritten by loaded data. */  
  for(let key in a) { /* For each component passed */
    let component = a[key];

    for (let name in component) { /* iterating its keys, in 99% there'll be 1 key with the component name itself */
      if (typeof component[name] == 'object' && !Array.isArray(component[name])) {
        if (name == 'websocketConfig') console.log("!websocketConfig current", b[name], "component", component[name], "initial", initial[name]);

        b[name] = { ...(b[name] || {}), ...component[name], ...(initial[name] || {}) }; /* Many mentions of the same component merged */
      } else if (typeof component[name] == 'object' && Array.isArray(component[name])) {
        b[name] = initial[name] || component[name];
      } else {
        b[name] = initial[name] || component[name];
      }
    }
  }

  // console.log("LOADING", initial);

  /* CASE 2 => Unknown entity type. Loading all. */
  // if (initial.type && !ecs.types[initial.type]) {
  //   log(`Loading unknown Entity type: ${initial.type}.`);
  //   const dontLoad = [ "id", "type", "savefile" ];
  //   for(let key in initial) {
  //     if (!~dontLoad.indexOf(key)) b[key] = initial[key];
  //   }
  // }

  // console.log("LOADED", b);
  
  const en = vue.reactive(b);

  if (d) core.log(`[ECS]Loading Entity ${en.meta ? en.meta.type : en.id}, ${d} keys upgraded.`);

  bindMethods({ entity: en, exclude });

  /* Instant piping-in to ecs.root */
  if (!ecs.root[en.id]) {
    ecs.root[en.id] = en;
    // console.log("PIPED IN", en.meta.name);
    ecs.totalCount++;
  } else {
    ecs.root[en.id] = en;
  }

  return en;
};

/* Components LVL 1 - should work in simple cases, pre component base stage. */
const Component = (name, structure) => {
  if (typeof structure == 'object') {
    if (Array.isArray(structure)) { /* Array-style component. class B- */
      return (a = []) => ({ 
        [name]: [ ...structure, ...a ] /* naive! should be pureClone */ /* probably very wrong */
      });
    } else { /* Object-style component. class B+ */
      return (a = {}) => ({ 
        [name]: { ...structure, ...a } /* naive! should be pureClone */
      });
    }
  } else {
    return (v) => ({ /* Non-structured component. not too much explored, class D-. */      
      [name]: v || structure
    });
  }
};
/* --[ Lvl 1 ] -------------------------------------------------- */

/* 
  Install enchantments from a[] into Entity e. Enchantments are to land in the Entity itself, be aware not to overwrite
  components: you are within the same namespace with them.

  This is a battle-tested version, was used in Yehat pre Beta I stage. Officially we are yet to introduce enchantments
  in ECS.
*/

const install = (e) => (a, context) => { /* Given an Array of Enchantments and a pool,
                                         will install the enchantments one by one,
                                         passing them the Entity and that pool. */
  a.forEach(fn => {
    const chant = fn(e, context);
    // console.log("fn(e)", fn(e));
    for(let i in chant) {
      e[i] = chant[i];
    }
    return e;
    //Object.assign(e, fn(e)); /* should be deepmerge */
  });
  
  return e;
};

const bindMethods = ({ entity, exclude = [], only }) => {
  /* hard built-in methods */
  [ { install } ].map(enchantMethod => {
    const name = Object.keys(enchantMethod)[0];
    const fn = enchantMethod[name];
    entity[name] = fn(entity);
    // console.log(`Bind methods ${entity.meta.name} METHOD ${name} RESULT`, entity[name], ` TYPE `, typeof entity[name], "DEFs", enchantMethod);
  });  
  for(let k in entity) {
    if (~exclude.indexOf(k)) continue;
    if (only && k != only) continue;

    let component = entity[k];  
    if (typeof component != 'object' || Array.isArray(component)) continue;    
    
    for (let key in component) {      
      let v = component[key];
      if (typeof v == 'function') {
        let returns = v(entity);
        if (typeof returns == 'undefined') {
          delete entity[k][key];
        } else {
          entity[k][key] = returns;
        }
      }
    }
  }

  return entity;
};

/* Current biases, settings, desicions within the ECS: 
  (They are not same as on the back-end side of the project for the sake of research purposes.)

  Entity ID - arbitrary
  Entity Registration - decentrallized, non-obligatory
  ECS Singleton - very early component base functionality singleton
  Component Methods - get bound at from loadEntity pipeline, and namely from bindMethods
                      function. Component Methods are being bound to COMPONENT!! 
                      NOT TO ENTITY!!
  Entity Types - arbitrary, non-obligatory
*/

const ecs = {
  version: "B-0.5",
  compo: {},
  compopedia: {},
  types: {},
  typeopedia: {},
  typeTags: {},
  root: vue.reactive({}),
  totalCount: 0, /* for to have the value up-to-date in reactive components */
  prefix: "yhtback0",
  homeDir: __dirname,
  define: (name, def, compopedia = { details: "No details." } ) => {
    ecs.compo[name] = Component(name, def);
    ecs.compopedia[name] = compopedia;
    return ecs.compo[name];
  },  
  declareType: (name, def = [], typeopedia = {}, init = (a) => a) => {
    /* def - Array of components or Function - constructor */
    ecs.types[name] = typeof def == "function" ? def 
                                               : ({ id, ...rest }) => 
                                                 init(loadEntity([ { type: name }, ...def ])({ id: id || core.slug(), ...rest }));
    ecs.typeopedia[name] = { details: "No details.", tags: [], ...typeopedia };
    return ecs.types[name];
  },
  declareCompoSet: (name, def = [], typeopedia = {}) => {
    ecs.types[name] = def;
    ecs.typeopedia[name] = { details: "No details.", tags: [], ...typeopedia };
    return ecs.types[name];
  },
  create: (type, { id, ...a } = {}) => {
    if (!ecs.types[type]) throw(`[ECS]Cannot create ${type}`);
    const entity = ecs.types[type]({ id, ...a });
    entity.type = type;
    return entity;
  },
  enforce: (type, { id, ...a } = {}) => {
    if (ecs.root[id]) {
      // ecs.root[id] = extend(true, ecs.root[id], a);
      ecs.root[id] = mergeDeep(ecs.root[id], a);
      return ecs.root[id];
    } else {
      return ecs.create(type, { id, ...a });
    }
  },
  remove: ({ id }) => {
    delete ecs.root[id];
  },
  /* Environment will be passed to every enchantment as a 2nd parameter */
  install: (e, a, env = {}) => {
    a.forEach(fn => {    
      const chant = fn(e, env);
      
      for(let i in chant) {
        e[i] = chant[i]; 
      }      
    });
  },
  loadDir: async ({ dirName }) => { /* returns Roster */   /* { IDaskdjahskd: { .... }, IDsdjhfasldkfy: { ..... } } */
                                    /*         Array */   /* [ { id: "IDaskdjahskd", ... },  { ... } ] */
    const fs = require("fs/promises");
    const path = require("path");

    let dir = null;
    
    const dn = path.join(__dirname, `../file-db/${dirName}`);

    dir = await fs.readdir(dn).catch(async e => {
      if(e.code == "ENOENT") {          
        await fs.mkdir(dn);
        await fs.chmod(dn, 0o755);
        log(`Directory ${dn} has been created just yet.`);
        return fs.readdir(dn);
      } else {
        log("FileDB access error", e, e.code, "reading dir", dn);
        throw(e);
      }
    });
    let c = 0;
    const loaded = reactive({}); /* =^_^= We don't we */
    for(let file of dir) {
      if (path.extname(file) !== '.json') continue;
      let v = null;

      try {
        v = JSON.parse(await fs.readFile(`${dn}/${file}`));
      } catch(e) {
        core.log(`[ECS]Error loading file ${dn}/${file}`, e);
        continue;
      }

      if (!v.type) {
        core.log(`[ECS]Skipped loading file ${dn}/${file} - no type.`);
        continue;
      }

      try {
        loaded[v.id] = await ecs.create(v.type, v);
        c++;
      } catch(e) {
        core.log(`[ECS]Error loading file ${dn}/${file} in ecs.create method.`, e);
      }
    }

    core.log(`[ECS] Entities loaded ${c} <= [Directory ${dn}]`);
    return loaded;
  },
  loadDirJSON: async ({ dirName }) => {
    const fs = require("fs/promises");
    const path = require("path");

    let dir = null;
    const dn = `./file-db/${dirName}`;

    try {
      dir = await fs.readdir(dn);
    } catch(e) {
      if (e.code == "ENOENT") {          
        log(`loadDirJSON Directory ${dn} does not exist.`);
      } else {
        log("loadDirJSON FileDB access error", e, e.code, "reading dir", dn);        
      }
      return [];
    }

    let c = 0;
    const output = [];
    for(let file of dir) {
      if (path.extname(file) !== '.json') continue;
      let v = null;

      try {
        v = JSON.parse(await fs.readFile(`${dn}/${file}`));
        output.push(v);
      } catch(e) {
        core.log(`[ECS]Error loading file ${dn}/${file}`, e);
        continue;
      }
    }

    return output;
  },
  loadOne: async (dirName, fileName) => {
    const fs = require("fs/promises");
    const path = require("path");
    if (path.extname(fileName) !== '.json') {
      core.log(`[ECS]loadOne Error -- fileName should have .json extension.`);
      return null;
    }
    let v = null;

    const dn = `./file-db/${dirName}`;

    try {
      v = JSON.parse(await fs.readFile(`${dn}/${fileName}`));
    } catch(e) {
      core.log(`[ECS]Error loading file ${dn}/${fileName}`, e);
      return null;
    }

    if (!v.type) {
      core.log(`[ECS]Skipped loading file ${dn}/${fileName} - no type.`);
      return null;
    }

    try {
      return await ecs.create(v.type, v);
    } catch(e) {
      core.log(`[ECS]Error loading file ${dn}/${fileName} in ecs.create method.`, e);
    }

    return null;
  },
  get: async (id, rel) => {
    return ecs.root[id] ? ecs.root[id] : ecs.loadOne(rel, `${id}.json`);
  },
  loadLocalInstances: async () => {
    if (isNode) {
      const fs = require("fs/promises");
      const path = require("path");

      let dir = null;

      dir = await fs.readdir("./file-db").catch(async e => {
        if(e.code == "ENOENT") {          
          await fs.mkdir("./file-db");
          await fs.chmod("./file-db", 0o755);
          log("FileDB has been created just yet.");
          return fs.readdir("./file-db");
        } else {
          log("FileDB access error", e, e.code);
          throw(e);
        }
      });
      let c = 0;
      for(let file of dir) {
        if (path.extname(file) !== '.json') continue;
        let v = null;

        try {
          v = JSON.parse(await fs.readFile(`./file-db/${file}`));
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/${file}`, e);
          continue;
        }

        if (!v.type) {
          core.log(`[ECS]Skipped loading file ./file-db/${file} - no type.`);
          continue;
        }

        try {
          await ecs.create(v.type, v);
          c++;
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/${file} in ecs.create method.`, e);
        }
      }

      dir = await fs.readdir("./file-db/users").catch(async e => {
        if (e.code == "ENOENT") {
          await fs.mkdir("./file-db/users");
          await fs.chmod("./file-db/users", 0o755);
          log("Users directory has been created.");
          return await fs.readdir("./file-db/users");
        }

        throw(e);
      });
      let dirsToScan = [];
      for(let file of dir) {
        if (path.extname(file) !== '.json') continue;
        let v = null;

        try {
          v = JSON.parse(await fs.readFile(`./file-db/users/${file}`));
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/users/${file}`, e);
          continue;
        }

        if (!v.type) {
          core.log(`[ECS]Skipped loading file ./file-db/users/${file} - no type.`);
          continue;
        }

        try {
          await ecs.create(v.type, v);
          dirsToScan.push(`./file-db/${v.id}`);
          c++;
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/users/${file} in ecs.create method.`, e);
        }
      }

      for (let dirName of dirsToScan) {
        try {
          dir = await fs.readdir(dirName);  
        } catch(e) {
          continue;
        }

        for(let file of dir) {
          if (path.extname(file) !== '.json') continue;
          let v = null;
  
          try {
            v = JSON.parse(await fs.readFile(`${dirName}/${file}`));
          } catch(e) {
            core.log(`[ECS]Error loading file ${dirName}/${file}`, e);
            continue;
          }
  
          if (!v.type) {
            core.log(`[ECS]Skipped loading file ${dirName}/${file} - no type.`);
            continue;
          }
  
          try {
            await ecs.create(v.type, v);            
            c++;
          } catch(e) {
            core.log(`[ECS]Error loading file ${dirName}/${file} in ecs.create method.`, e);
          }
        }
      }

      dir = await fs.readdir("./file-db/public-root").catch(async e => {
        if (e.code == "ENOENT") {
          await fs.mkdir("./file-db/public-root");
          await fs.chmod("./file-db/public-root", 0o755);
          log("Users directory has been created.");
          return await fs.readdir("./file-db/public-root");
        }

        throw(e);
      });
      dirsToScan = [];
      for(let file of dir) {
        if (path.extname(file) !== '.json') continue;
        let v = null;

        try {
          v = JSON.parse(await fs.readFile(`./file-db/public-root/${file}`));
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/public-root/${file}`, e);
          continue;
        }

        if (!v.type) {
          core.log(`[ECS]Skipped loading file ./file-db/public-root/${file} - no type.`);
          continue;
        }

        try {
          await ecs.create(v.type, v);
          dirsToScan.push(`./file-db/public-root/${v.id}`);
          c++;
        } catch(e) {
          core.log(`[ECS]Error loading file ./file-db/public-root/${file} in ecs.create method.`, e);
        }
      }

      for (let dirName of dirsToScan) {
        try {
          dir = await fs.readdir(dirName);  
        } catch(e) {
          continue;
        }

        for(let file of dir) {
          if (path.extname(file) !== '.json') continue;
          let v = null;
  
          try {
            v = JSON.parse(await fs.readFile(`${dirName}/${file}`));
          } catch(e) {
            core.log(`[ECS]Error loading file ${dirName}/${file}`, e);
            continue;
          }
  
          if (!v.type) {
            core.log(`[ECS]Skipped loading file ${dirName}/${file} - no type.`);
            continue;
          }
  
          try {
            await ecs.create(v.type, v);            
            c++;
          } catch(e) {
            core.log(`[ECS]Error loading file ${dirName}/${file} in ecs.create method.`, e);
          }
        }
      }


      core.log(`[ECS]Local instances loaded: ${c}`);
    } else {      
      /* Browser */
      const roster = JSON.parse(localStorage[`${ecs.prefix}-local-roster`] || '{}');
      // console.log("Roster: ", roster);
      /* keys: IDs, values: types */
      let c = 0, skipped = 0, ca = [];
      Object.keys(roster).map(id => {
        let type = roster[id];
        try {
          if (!ecs.types[type]) {
            core.log(`[ECS]Unknow type: ${type}`);
            return;
          }

          if (!ecs.root[id]) {
            // ecs.root[id] = ecs.types[type]({ id });
            // const saved = JSON.parse(localStorage)
            ecs.create(type, { id });
            c++;
            // ecs.totalCount++;
          } else {
            skipped++;
            // ecs.root[id] = ecs.types[type]({ id });
          }

          
          if (logging.loadingVerbose) ca.push(ecs.root[id].meta ? ecs.root[id].meta.name : "-Unknown-");
        } catch(e) {
          core.log(`[ECS]Failed to load Local Instance ${id} with type ${type}.`, e);    
        }
      });
    }
  },
  erase: async ({ entityID, rel }) => {
    if (isNode) {
      if (!rel) throw("Have to pass `rel` to delete an Entity.");
      if (!ecs.exists({ id: entityID, rel })) return;

      const fs = require("fs/promises");
      const filename = rel ? `./file-db/${rel}/${entityID}.json` : `./file-db/${entityID}.json`;
      await fs.unlink(filename);
      delete ecs.root[entityID];
    } else { /* browser */
      const roster = JSON.parse(localStorage[`${ecs.prefix}-local-roster`] || '{}');

      if (roster[entityID]) {
        delete roster[entityID];
        localStorage[`${ecs.prefix}-local-roster`] = JSON.stringify(roster);
        core.log(`[ECS]Entity ${entityID} deleted from roster.`);
      } else {
        core.log(`[ECS]Entity ${entityID} was not in roster.`);
      }

      delete localStorage[`${ecs.prefix}-${entityID}`];
    }
  },
  bindMethods,
  loadEntity,
  enchantments: {
    connections: [
      (item) => {
        console.log("[ECS]T5 Connections", item);
        if (item.connections) {
          item.c = vue.computed(() => {
            console.log("[ECS]Recomputing connections", item.meta.name, Object.keys(item.connections).length);
            const a = {};
            for(let key in item.connections) {
              a[key] = ecs.root[item.connections[key]];
            }
            return a;
          });
          console.log("[ECS]T5 Connections Installed", item.meta ? item.meta.name : '- Unknown -');
        }
      }
    ]
  },
  find: (a) => Object.values(ecs.root).filter(a),
  findOne: (a) => ecs.find(a)[0] || null,
  boot: async (a, { common, dropNulls } = {}) => {
    let created = 0, updated = 0, skipped = 0;

    const items = [];

    for(let item of a) {
      try {
        const { id = core.slug(), type, ...rest } = { ...(common || {}), ...item };
        if (!ecs.types[type]) {
          core.log(`[ECS]Booting file skipping unknown type: ${type} id: ${id}`, e);
          skipped++;
          if (!dropNulls) items.push(null);
          continue;
        }

        /* ecs.enforce action then, but we want to know was it updated or created => code duplication */

        if (ecs.root[id]) {
          if (!ecs.root[id].type || ecs.root[id].type == type) {
            /* low grade things -or- the same type -- just extending */
            // ecs.root[id] = extend(true, ecs.root[id], a);
            ecs.root[id] = mergeDeep(ecs.root[id], a);
            items.push(ecs.root[id]);
            updated++;
          } else {
            /* Exists within the root but with another type => kill and recreate =^_^= */
            delete ecs.root[id];
            await ecs.create(type, { id, ...rest });
            items.push(ecs.root[id]);
            created++;
          }
        } else {
          await ecs.create(type, { id, ...rest });
          items.push(ecs.root[id]);
          created++;
        }        
      } catch(e) {
        core.log(`[ECS]Booting file exception on item ${item.id}`, e);
        if (!dropNulls) items.push(null);
      }
    }

    return items;
  },
  exists: async({ id, rel }) => {
    const filename = rel ? `./file-db/${rel}/${id}.json` : `./file-db/${id}.json`;
    const fs = require("fs");
    return new Promise((resolve) => {
      fs.access(filename, fs.constants.F_OK, (err) => {
        resolve(!err);
        console.log(`${filename} ${err ? 'does not exist' : 'exists'}`);
      });
    });
  },
  toJSON: (item) => { /* Intended to be on server-side, not needed here at the moment */
    const { c, ...rest } = item;
    return JSON.stringify(rest, null, 2);
  },
  bootSource: ({ compo, types }) => {
    let cCompo = 0, cType = 0;

    for(let name in compo) {
      let { hull, ...tail } = compo[name];
      let description = { details: "- No details", ...tail };
      
      ecs.define(name, hull, description);
      cCompo++;
    }

    for(let name in types) {
      let { hull, ...tail } = types[name];
      let description = { details: "- No details -", ...tail };

      ecs.declareType(name, hull(), description);
      cType++;
    }

    log(`bootSource: ${cCompo} components(s), ${cType} type(s) booted.`);
  },
  unbox: (roster) => {
    const stat = {
      loaded: 0,
      skipped: 0,
      ids: []
    };

    for(let id in roster) {
      let { contains, ...item } = roster[id];
      let { type } = item;
      if (type && ecs.types[type]) {
        ecs.create(type, { id, ...item });
        stat.ids.push(id);
        stat.loaded++;
      } else {
        core.log(`[ECS]Cannot create type ${type} -> skipped.`);
        stat.skipped++;
      }

      if (contains) {
        let { loaded, skipped, ids } = ecs.unbox(contains);
        stat.ids = [ ...stat.ids, ...ids ];
        stat.loaded += loaded;
        stat.skipped += skipped;
      }
    }

    return stat;
  },
  by: (p, { map, sort, process } = {}) => computed(() => { 
    const a = ecs.find(p);
    let b;
    if (!map && !sort) {
      b = a;
    } else if (map && !sort) {
      b = a.map(map);
    } else if (!map && sort) {
      b = a.sort(sort);
    } else if (map && sort) {
      b = a.sort(sort).map(map);
    }    
    return process ? process(b) : b;
  }), /* computed projection over a predicate =^_^= */
  byOne: (p) => computed(() => ecs.findOne(p)),
  byQuery: (query, options) => {
    return ecs.by(ecs.queryToPredicate(query), options);
  },
  queryToPredicate: (query) => {
    return new Function("v", `return (${query});`);
  },
  singleton: (p) => computed(() => ecs.find(p)[0]),
};

// ecs.declareType(
//   "Entity", Entity, 
//   { details: "[ The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS ]-[ Lvl 3 ]" }
// );

/* The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS */
const Entity = ecs.declareType(
  "Entity", 
  (a = {}) => vue.reactive({ id: core.uuid(), ...a }), 
  { 
    details: "[ The ONE and THE ONLY TRUE AUTHENTHIC ENTITY FACTORY in ZII ECS ]-[ Lvl 4 ]"
  }
);
/* --[ Lvl 4 ] -------------------------------------------------- */

const define = ecs.define;
const declareType = ecs.declareType;


/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
 function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

exports.Component = Component;
exports.Entity = Entity;
exports.Entity1 = Entity1;
exports.bindMethods = bindMethods;
exports.declareType = declareType;
exports.define = define;
exports.ecs = ecs;
exports.isObject = isObject;
exports.loadEntity = loadEntity;
exports.mergeDeep = mergeDeep;
