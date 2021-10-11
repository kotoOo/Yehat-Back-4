(self["webpackChunkpropertyleads_2"]=self["webpackChunkpropertyleads_2"]||[]).push([[366],{48425:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  compo: {\n    cargo2: {\n      hull: {\n        json: null,\n        rawSize: null,\n        sha256: null,\n        dtDeployed: null,\n        by: null,\n        on: null\n      },\n      details: "Cargo MK 2 State"\n    },\n    cargo2payload: {\n      hull: {\n        json: null\n      },\n      details: "Cargo MK 2 Payload"\n    },\n    cargo2stat: {\n      hull: {\n        packedRoot: 0,\n        packedContained: 0,\n        packedTotal: 0\n      },\n      details: "Cargo MK2 Stat"\n    },\n    diaCreate0: {\n      hull: {},\n      details: "Simple (No INPUT) items creating Dialog for ZIITable5"\n    },\n    item: {\n      hull: {\n        baseComponent: "IAbstract",\n        inventoryComponent: null,\n        cargoStyle: null,\n        style: null,\n        show: false,\n        opened: false,\n        baseIcon: null,\n        baseImage: null,\n        onClick: null,\n        name: \'\'\n        /* Many types are difficult to be visualized if they\'re not consistent where they store names */\n\n      },\n      details: `Makes entity renderable on ZII Table3.`\n    },\n    lang: {\n      hull: {\n        en: {},\n        ru: {},\n        enchantI: item => {\n          item.i = computed(() => item.lang[core.yehat.lang]);\n          return () => {};\n        }\n      },\n      details: "Multilingual Content Container"\n    },\n    located: {\n      hull: {\n        rel: null,\n        pos: [0, 0, 0],\n        size: [0, 0]\n      },\n      details: `Entity\'s parent container ID and Vector3 position inside of it.`\n    },\n    meta: {\n      hull: {\n        type: "Unknown",\n        name: "No name",\n        tags: []\n      },\n      details: "General meta-information about an Entity, such its \\"type\\" (archetype, classification of the Entity Class amongst other Entity Classes), and its \\"name\\" (Entity Class name, arbitrary)."\n    },\n    slapTarget0: {\n      hull: {\n        roster: {},\n        slap: item => ({\n          code = \'draw\',\n          source = null,\n          payload = null\n        } = {}) => {\n          if (!item.slapTarget0.roster[code]) {\n            console.warn(`[${item.type} ${item.id}] Slap received to an unknown slot [${code}]`);\n            return;\n          }\n\n          if (typeof item.slapTarget0.roster[code] === \'function\') {\n            console.log(`Slap0 received on slot ${code}. Calling the handler...`);\n            return item.slapTarget0.roster[code]({\n              source,\n              payload\n            });\n          } else if (typeof item.slapTarget0.roster[code] === \'string\') {\n            const fn = ({\n              source,\n              payload\n            }) => {\n              /* NOP slug for the string-declared Slap targets. */\n              console.log(`Slap0 received on slot ${code} UNP0 string:`, item.slapTarget0.roster[code], \' => NOP SLUG\');\n              return;\n            };\n\n            return fn({\n              source,\n              payload\n            });\n          } else {\n            console.warn("Unknown Slap0 handler type: ", typeof item.slapTarget0.roster[code], item.slapTarget0.roster[code]);\n          }\n        }\n      },\n      details: "The component used for to declare Entity to be a Slap Receiver just by its presence. Roster: keys -- slot names, values -- called methods on the VDs side."\n    },\n    tier: {\n      hull: {\n        base: "proto"\n      },\n      details: "Base Tier: enum | proto in-progress monkeys poormans standard premium epic hisb legendary glorious"\n    }\n  },\n  types: {\n    Cargo2: {\n      hull: () => [ecs.compo.cargo2(), ecs.compo.cargo2stat(), ecs.compo.item({\n        baseComponent: "Cargo2",\n        inventoryComponent: "Cargo2Item",\n        baseIcon: __webpack_require__(92701)\n      }), ecs.compo.located(), ecs.compo.meta({\n        name: "Cargo MK2 Box",\n        type: "Cargo2"\n      }), ecs.compo.dialog0(), ecs.compo.tier({\n        base: "poormans"\n      }), ecs.compo.lang({\n        en: {\n          title: "Cargo MK2",\n          subtitle: "Entities in the box"\n        },\n        ru: {\n          title: "Cargo MK2",\n          subtitle: "Объекты, сгруппированные вместе"\n        }\n      }) // ecs.compo.saveFile({\n      //   cargo2: true, cargo2stat: true\n      // })\n      ],\n      details: "Cargo MK 2 - (UN)Stackable Yehat Boxes"\n    },\n    DiaCreate0: {\n      hull: () => [ecs.compo.diaCreate0(), ecs.compo.dialog0(), ecs.compo.meta({\n        type: "DiaCreate0",\n        name: "Dialog to Create an Item"\n      }), ecs.compo.tier({\n        base: "proto"\n      }), ecs.compo.item({\n        baseComponent: "DiaCreate0",\n        name: "Create Item",\n        onClick: item => () => item.dialog0.show = true\n      }), ecs.compo.located()],\n      details: "Simple (No INPUT) items creating Dialog for ZIITable5"\n    }\n  },\n  roster: {},\n  meta: {\n    name: "Source0",\n    type: "Yehat JSON Container",\n\n    /* true meta component... hmm.. it IS really strange matters... */\n    version: "1.0",\n    by: "[MemberCard KotoTheBest]",\n    on: "[DryWare KotoSurf]",\n    dtCreated: 1630536120,\n    manual: true\n  }\n});\n\n//# sourceURL=webpack://propertyleads-2/./src/yehat/sources/00-source-0.js?')},92701:module=>{eval('module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAAAs9JREFUaIHtmsFq2zAYx/9dyg697OIZJ+QaOigLo4Od9gA97gFyGPS458kx0EMfIs8wqCkZg4xeg2dcX3rJIbTzDonsT7JsS4lsJ6l+EFxZsqKfP1my1AAWi8VisVgsFosRTtpugIjX6yc0HQYLo208NVlZFaKMjO+9BZe+QT8xKW2kIhURgJf5cfWhsvx4OgcA3AR9Y5GujLBuVMpFqiXrJicsCjKZtkVUe5EM2js4Ya/XT/KC7UeF4rnONpel40AqLJfdL5jsu/c95WueHgMu/cZoi2rEcx2EUYyvV9/w8fMX7gOg8CjS6LSkAxuhGWEU4/xiCAD4dfczPV8kVsReCTNJP+4A6ODSeUnzPNfBn98zLqpUXJXGhHmZIvg8P86kwyiG5zqpZFFkq27CzsJqIoAoowqrlz7DRdIq3Tudn+goDaxHanUZfWarbmWZ4du/XFn2DOvw9BggjGLkpiWKH3dwffuAbaKiIgIAYbCoLtTrp3+yZ/j8Ylh6FBHn7VyEy6KpIqMkoom3Ed/mpSOM4vVxE2FOmHUhEdWoNcG20qVdmsFEveegrFjthKfZmxWLWBllNyUnPBkNMJ7Os9FxI+uetbNXEC0TrRtOb46MnLD4hgO0J6v73dGyekGVE2aRna268J6DVmV1cc9OgGWAMCru1pwwHZwOTZZBpWVQo+STmy2eDlGWQrv3ffQP2LgqTUuHzmzVTaelg1kPm8IKHzuvTlh7PTwZDXLn1isreRmaNxkNcH37oJVPy8nOF7WhCO1Rmm67MMQVFi1D8y6dF24XA1ivu1ljZfm0Htn5ojZQdhql/bhjdENgPJ3nIifWz9Ky79ZtT+vPsB93pNJ10bowkEk3wV4IA/Xsm8nYG+GmsMLHjhU2zWQ0SD8615Sld6GW/y3RtyI63aiOxOIUtU6bGcXtBsCx8+qEuZ26XX4ps8+Y/jWfxWKxWOriPz/iUE0UkTLPAAAAAElFTkSuQmCC"\n\n//# sourceURL=webpack://propertyleads-2/./src/yehat/assets/cargo0-legend.png?')}}]);