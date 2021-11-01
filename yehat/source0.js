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
  }
};
