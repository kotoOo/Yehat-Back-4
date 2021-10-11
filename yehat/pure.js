const { computed } = require("vue");

global.pure = {
  EPGET: (entity, ep) => {
    const traverse = ep.split(".");
    let cursor = entity;
    while(traverse.length) {
      let token = traverse.splice(0,1)[0];
      if (!cursor[token]) return undefined;
      cursor = cursor[token];
    }

    return cursor;
  },

  itemName: item => {
    const typeToNameEP = {
      Cargo0: "cargo0.name",
      Code0: "code0.name",
      Code1: "code1.name",
      GTDStatus0: "gtdStatus0.name",
      Page0: "page0.name",
      Gal0: "gal0.name",
      SHHNPage0: "page0.name",
      Project: "project0.name",
      Cat0: "cat0.name",
      Mission0: "mission0.short",
      MemberCard0: "memberCard0.name"
    };

    if (!item) {
      return "NaE";
    } else if (typeToNameEP[item.type]) {
      return pure.EPGET(item, typeToNameEP[item.type]) || "";
    } else if (item.item) {
      return item.item.name;
    } else {
      return item.id;
    }
  },

  itemExtra: (item) => {
    const typeToExtra = {
      Code1: (item) => `-[HSS0 ${ pure.humanStorageSize(item.code1.code.length) }]-[Stack ${item.code1seq.stack.length}]`
    };

    return typeToExtra[item.type] ? typeToExtra[item.type](item) : "";
  },

  itemToken: item => {
    if(!item) return `[NaE]`;
    const name = pure.itemName(item);
    return name ? `[${item.type || "Unknown"} ${name}]` : `[${item.type || "Unknown"}]`;
  },

  itemTokenExt0: item => {    
    return pure.itemToken(item)+pure.itemExtra(item);
  },

  humanStorageSize: (e) => {
    const be = ["B", "KB", "MB", "GB", "TB", "PB"];
    let t = 0;
    while (parseInt(e, 10) >= 1024 && t < be.length - 1)
      e /= 1024,
      ++t;
    return `${e.toFixed(1)}${be[t]}`;
  },

  jsTypeToString: (v) => {
    if (Array.isArray(v)) {
      if (!v.length) return `[Empty Array]`;
      return `[Array ${v.map(x => jsTypeToString(x)).join(" ")}]-[Size ${v.length}]`;
    } else if (typeof v === "object") {
      if (!Object.keys(v).length) {
        if (v.constructor && v.constructor.name) {
          function getAllPropertyNames (obj) {
            const proto     = Object.getPrototypeOf(obj);
            const inherited = (proto) ? getAllPropertyNames(proto) : [];
            return [...new Set(Object.getOwnPropertyNames(obj).concat(inherited))];
          }
          const methods = getAllPropertyNames(v).filter(m => typeof v[m] === 'function');

          return `[Empty Object::${ v.constructor.name }] Methods: ${ methods.join(" ") }`;
        }
        return `[Empty Plain Object]`;
      }
      return `[${v.type || "Object"} ${Object.keys(v).join(" ")}]`;
    } else if (!v) {
      return typeof v === 'undefined' ? 'undefined' : (
        v === null ? "null" : (
          typeof v === "string" ? '""' : (
            typeof v === "boolean" ? `${v}` : ""+v
          )
        )
      );
    } else {
      return ""+v;
    }
  },

  indexToCR: (code, index) => {
    const lineBreaks = [ ...code.matchAll(/\n/g) ].map(v => v.index);

    const cr = [ index, 0 ];
    for(let lineEnds of lineBreaks) {
      if (index > lineEnds) {
        cr[0] = index - lineEnds - 1;
        cr[1]++;
      } else {
        break;
      }
    }

    return cr;
  },

  safeStringify: (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
      obj,
      (key, value) =>
        typeof value === "object" && value !== null
          ? cache.includes(value)
            ? undefined // Duplicate reference found, discard key
            : cache.push(value) && value // Store value in our collection
          : value,
      indent
    );
    cache = null;
    return retVal;
  },

  arrayCount: (a) => computed(() => a.length)
};