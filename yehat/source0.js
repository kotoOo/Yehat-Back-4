module.exports = {
  compo: {
    actions: {
      hull: {},
      details: "Roster of handlers, free for all"
    },
    conn: {
      hull: {},
      details: "Non-reactive connections."
    },
    connections: {
      hull: {},
      details: `Non-reactive connections Component for backend.`
    },
    located: {
      hull: {
        rel: null,
        pos: [ 0, 0, 0 ],
        size: [ 0, 0 ]
      }, 
      details: `Entity's parent container ID and Vector3 position inside of it.` 
    },
    emailDelivery0: {
      hull: {
        emails: [], 
        origin: null, 
        type:null, 
        dtCreated: null,
        payload: {},
        failures: [],
        success: [],
        allGood: false
      }, 
      details: "EmailDelivery0 Hull"
    },
    emailDelivery0payload: {
      hull: {
        json: null
      },
      details: "EmailDelivery0 Payload"
    },
    ledger0: {
      hull: {},
      details: "Ledger0 Configuration" 
    },
    meta: {
      hull: {
        type: "Unknown",
        name: "No name",
        tags: [],
      },
      details: "General meta-information about an Entity, such its \"type\" (archetype, classification of the Entity Class amongst other Entity Classes), and its \"name\" (Entity Class name, arbitrary)."
    },
    messageBase0: {
      hull: {
        newMessages: {}, /* roster, key: `${from}@${rel}`, value: msg0 ID for new message, if exists. VOLATILE */        
        items: (item) => ecs.by(v => v.type === 'Msg0' && v.located.rel === item.id),
        count: (item) => pure.arrayCount(item.messageBase0.items)
      },
      details: "Primarity a contained for Messages, however maybe gonna be a facility in future."
    },
    msg0: {
      hull: {
        msg: "",
        type: "plain"
      },
      details: "A Message on channel"
    },
    msg0vtm: {
      hull: {
        dtStart: null,
        dtUpdated: null,
        dtCreated: null,
        dtModified: null,
        updates: 0,
        edits: 0
      },
      details: "Message0 timestamps"
    },
    msg0seenby: {
      hull: {
        roster: {}
      },
      details: "Message0 Seen By. roster: keys - memberCardID, values: { dt, deviceID, synced: Boolean }"
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
      
          return fs.writeFile(location, JSON.stringify(a)).then(() => {      
            core.log(`[ECS]Saved File Instance [${item.meta ? item.meta.name : item.type}] #${item.id} => ${location}.`);
            // core.log(JSON.stringify(a, null, 2));
            if (!item.type) core.log("Warning! No type.");
          });
        }
      }, 
      details: "JSON filesystem-based persistence."
    },
    cargo2: {
      hull: {
        rawSize: null,
        sha256: null,
        dtDeployed: null,
        by: null,
        on: null
      },
      details: "Cargo MK 2 State"
    },
    cargo2payload: {
      hull: {
        json: null
      },
      details: "Cargo MK 2 Payload"
    },
    cargo2stat: {
      hull: {
        packedRoot: 0,
        packedContained: 0,
        packedTotal: 0
      },
      details: "Cargo MK2 Stat"
    },
    project0: {
      hull: {
        name: "",
      }, 
      details: "A Project"
    },    
    project0status: {
      hull: {
        dtRegistered: null,
        founderID: null
      }, 
      details: "Tech flags about a Project" 
    },
    project0members: {
      hull: {
        roster: {},
        isMember: (item) => (id) => {
          return !!item.project0members.roster[id];
        },
        add: (item) => (id, roles = [], effects = []) => {
          if (item.project0members.isMember(id)) return false;
          item.project0members.roster[id] = {
            memberCardID: id,
            memberName: ecs.root[id].memberCard0.name || "- No name -",
            roles,
            effects
          };
      
          item.saveLocal.save();
          item.saveRemote.save();
      
          return true;
        },
        banish: (item) => (id) => {
          if (!item.project0members.isMember(id)) return false;
          delete item.project0members.roster[id];
      
          item.saveLocal.save();
          item.saveRemote.save();
      
          return true;
        },
        hasRole: (item) => (id, role) => {
          if (!item.project0members.isMember(id)) return false;
          return !!~item.project0members.roster[id].roles.indexOf(role);
        },
        toggleRole: (item) => (id, role) => {
          if (!item.project0members.isMember(id)) return false;
          if (item.project0members.hasRole(id, role)) {
            const index = item.project0members.roster[id].roles.indexOf(role);
            item.project0members.roster[id].roles.splice(index, 1);
          } else {
            item.project0members.roster[id].roles.push(role);
          }
      
          item.saveLocal.save();
          item.saveRemote.save();
      
          return true;
        }
      }, 
      details: "Project Members"
    },
    tier: {
      hull: {
        base: "proto"
      },
      details: "Base Tier: enum | proto monkeys poormans standard premium epic legend"
    }
  },
  types: {
    Cargo2: {
      hull: () => [
        ecs.compo.cargo2(),
        ecs.compo.cargo2stat(),
        ecs.compo.cargo2payload(),
        ecs.compo.located(),
        ecs.compo.saveFile({
          cargo2: true, cargo2payload: true, cargo2stat: true, located: true
        })
      ],
      details: "Cargo MK 2 - Stackable Yehat Boxes"
    },
    EmailDelivery0: {
      hull: () => [
        ecs.compo.emailDelivery0(),
        ecs.compo.emailDelivery0payload(),
        ecs.compo.located(),
        ecs.compo.connections(),
        ecs.compo.saveFile({
          emailDelivery0: true, emailDelivery0payload: true, located:true, connections: true
        })
      ],
      details: "Email Delivery Report"
    },
    Ledger0: {
      hull: () => [
        ecs.compo.ledger0(),
        ecs.compo.connections({
          admin: null
        }),
        ecs.compo.saveFile({ ledger0: true, connections: true })
      ], 
      details: "Ledger0 Singleton Centralized Ledger pure naive, targeting poormans." 
    },
    Msg0: {
      hull: () => [
        ecs.compo.msg0(),
        ecs.compo.msg0vtm(),
        ecs.compo.msg0seenby(),
        ecs.compo.meta({ type: "Msg0", name: "Message" }),
        ecs.compo.actions(),
        ecs.compo.conn({
          from: null, /* memberCardID */
          to: null, /* memberCardID, "all" */
          rel: null
        }),
        ecs.compo.located(),
        ecs.compo.tier(),
        ecs.compo.saveFile({          
          msg0: true, msg0vtm: true, msg0seenby: true, conn: true, located: true, tier: true
        }),
        // ecs.compo.saveRemote({
        //   msg0: true, msg0vtm: true, msg0seenby: true, conn: true, located: true, tier: true
        // }),
        
      ],
      details: "A Message on channel"
    },
    MessageBase0: {
      hull: () => [
        ecs.compo.messageBase0(),
        ecs.compo.meta({ type: "MessageBase0", name: "Message Base" }),
        ecs.compo.actions(),
        ecs.compo.located(),
        ecs.compo.saveFile({
          // self: true, type: "MessageBase0", 
          messageBase0: true, located: true
        })
      ],
      details: "Message Base"
    },
    Project: {
      hull: () => [
        ecs.compo.project0(),  
        ecs.compo.project0status(),
        ecs.compo.project0members(),
        // ecs.compo.owner0({ access: 'public' }),
        // ecs.compo.fav0(),
        ecs.compo.meta({ type: "Project", name: "A Project" }),
        ecs.compo.connections({
          owner: null
        }),
        ecs.compo.tier({ base: "proto" }),
        // ecs.compo.saveLocal({
        //   self: true, type: "Project", project0: true, owner0: true, connections: true, saveLocal: true, tier: true,
        //   fav0: true
        // }),
        ecs.compo.located(),
        ecs.compo.saveFile({
          located: true, project0: true, project0status: true, project0members: true, connections: true, tier: true
        })
      ], 
      details: "Project" 
    }
  },
};
