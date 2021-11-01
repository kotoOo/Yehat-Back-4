module.exports = {
  compo: {
    cmdLine1: {
      hull: {
        command: "",
        prompt: "[Yehat Back]>",
        focused: false,
        history: [],
        historyCursor: null,
        historyLimit: 256,
        eval: (item) => (cmd) => {

        },
        enter: (item) => async () => {
          const command = item.cmdLine1.command;

          item.cmdLine1.pushHistory(command);
          item.cmdLine1.historyCursor = null;
          item.cmdLine1.command = '';
    
          if (item.saveFile) await item.saveFile.save();

          const result = item.cmdLine1.eval(command);
          return result;
        },
        up: (item) => () => {
          if (item.cmdLine1.historyCursor === null) {              
            item.cmdLine1.history = [ item.cmdLine1.command.trim(), ...item.cmdLine1.history ];
            item.cmdLine1.historyCursor = 1;
            item.cmdLine1.command = item.cmdLine1.history[1];
            // goEOL();
            core.log(`${pure.itemToken(item)} [cmdline1.up]> History UP historyCursor =`, item.cmdLine1.historyCursor);
          } else if (item.cmdLine1.historyCursor < item.cmdLine1.history.length - 1) {              
            item.cmdLine1.history[item.cmdLine1.historyCursor] = item.cmdLine1.command;
            item.cmdLine1.historyCursor++;
            item.cmdLine1.command = item.cmdLine1.history[item.cmdLine1.historyCursor];
            // goEOL();
            core.log(`${pure.itemToken(item)} [cmdline1.up]> History UP historyCursor =`, item.cmdLine1.historyCursor);
          } else {
            core.log(`${pure.itemToken(item)} [cmdline1.up]> Top of history buffer.`);
          }
          return item.cmdLine1.command;
        },
        down: (item) => () => {
          if (item.cmdLine1.historyCursor) {              
            item.cmdLine1.history[item.cmdLine1.historyCursor] = item.cmdLine1.command;
            item.cmdLine1.historyCursor--;
            item.cmdLine1.command = item.cmdLine1.history[item.cmdLine1.historyCursor];
            // goEOL();
            core.log(`${pure.itemToken(item)} [cmdline1.up]> History UP historyCursor =`, item.cmdLine1.historyCursor);
          } else {
            core.log(`${pure.itemToken(item)} [cmdline1.up]> Bottom of history buffer.`);
          }
          return item.cmdLine1.command;
        },
        pushHistory: (item) => v => item.cmdLine1.history = [ v, ...item.cmdLine1.history ].slice(0, item.cmdLine1.historyLimit),
      }
    },
    located: {
      hull: {
        rel: null,
        pos: [ 0, 0, 0 ],
        size: [ 0, 0 ]
      }, 
      details: `Entity's parent container ID and Vector3 position inside of it.` 
    },
    meta: {
      hull: {
        type: "Unknown",
        name: "No name",
        tags: [],
      },
      details: "General meta-information about an Entity, such its \"type\" (archetype, classification of the Entity Class amongst other Entity Classes), and its \"name\" (Entity Class name, arbitrary)."
    },
    saveFile: {
      hull: {
        save: (item) => async() => {
          const fs = require("fs/promises");
          const path = require("path");
          const a = { id: item.id, type: item.type };
          for (let key in item.saveFile) {
            let v = item.saveFile[key];
      
            if (key == "forceUpgrade") continue;
      
            if (Array.isArray(v)) {
              a[key] = {};
              v.forEach(name => {
                if (item[key]) a[key][name] = item[key][name]
              });
            } else if (v === true) {
              a[key] = item[key];
            }
          }
      
          let location = null;
          core.log(`[ECS]Saving [${item.meta ? item.meta.name : item.type}] ${item.id}...`, item.located);


          const homeDir = path.join(ecs.homeDir, `../file-db`);

          if (item.located && item.located.rel) {
            await fs.mkdir(path.join(homeDir, item.located.rel)).catch(e => {
              if (e.code != 'EEXIST') {
                core.log("[ECS]saveFile.save mkdir error", e);
              } else {
                return fs.chmod(path.join(homeDir, item.located.rel), 0o755);
              }
            });      
      
            location = path.join(homeDir, item.located.rel, `${item.id}.json`); /* in Cargo */
          } else {
            location = path.join(homeDir, `${item.id}.json`);                   /* in Home */
          }

          const random = core.randomHex8();
      
          return fs.writeFile(`${location}.${random}.tmp`, JSON.stringify(a)).then(() => fs.rename(`${location}.${random}.tmp`, location)).then(() => {            
            core.log(`[ECS]Saved File Instance [${item.meta ? item.meta.name : item.type}] #${item.id} => ${location}.`);
            // core.log(JSON.stringify(a, null, 2));
            if (!item.type) core.log("Warning! No type.");
          }).catch(e => core.log(`[ECS]saveFile Error ${e.message}`, e.stack));
        }
      }, 
      details: "JSON filesystem-based persistence. @v2 -- atomic writes"
    },
  },
  types: {
    Cargo0: {
      hull: () => [
        ecs.compo.meta({ type: "Cargo", name: "Cargo0" }),
        ecs.compo.saveFile(),
      ], 
      details: "A Directory of Entities"
    },
    CmdLine1: {
      hull: () => [
        ecs.compo.meta({ type: "Utility", name: "CommandLine" }),
        ecs.compo.cmdLine1(),
        ecs.compo.located(),
        ecs.compo.saveFile({ cmdLine1: true, located: true })
      ],
      details: "Terminal-based command line."
    },
  },
  roster: {
    'back-root': {
      type: "Cargo0",
      init: (item) => {
        core.log(`[Cargo0 ${item.id}] <[init]`);
        return item.saveFile.save();
      }
    },
    cmdLine: {
      type: "CmdLine1",
      located: {
        rel: 'back-root'
      }
    }
  },
  meta: {
    name: "00-BackRoot", type: "YehatSource0", /* true meta component... hmm.. it IS really strange matters... */
    version: "1.1", by: "[MemberCard KotoTheBest]", on: "[DryWare KotoSurf]",
    dtCreated: 1635086148, manual: true
  }
};