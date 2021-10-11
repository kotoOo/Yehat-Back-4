const { ecs } = require("../yehat/ecs.cjs");

module.exports = () => {
  const log = core.makeLog("ECS");

  const get = (id) => ecs.root[id] || null;
  const isEntityExist = (id) => !!get(id);

  // const getEntity = (id) => {
  //   const a = core.db.entities({ id }).get();
  //   return a.length ? a[0] : null;
  // };

  const ioEntityExists = async ({ id, rel }) => {
    if (rel) await ecs.loadDir({ dirName: rel });

    return { code: "ok", result: isEntityExist(id) };
  };

  const ioSave = async ({ entity }, { socket, session }) => {
    if (!entity || typeof entity != 'object') return { code: "fail", details: "Bad entity." };
    const userID = session.connections.user;

    if (!userID) return { code: "fail", details: "Access denied." };

    let { id, located } = entity;
    if (!id) id = core.slug();

    if (located && located.rel) {
      await ecs.loadDir({ dirName: located.rel });
    } 

    const inDB = get(id);
    console.log("..:", inDB ? "Exists" : "Doesn't Exist");

    const dontSave = [ "id", "type", "saveFile" ];

    if (!inDB) {
      // const item = {
      //   ...entity, id,
      //   saveFile: {}
      // };

      const item = await ecs.create("Cargo1", { ...entity, id });
      item.type = entity.type;

      for (let key in entity) {
        if (!~dontSave.indexOf(key)) {
          item[key] = entity[key];
          item.saveFile[key] = true;
        }
      }
      await item.saveFile.save();

      if (item.located && item.located.rel) socket.to(item.located.rel, "ea", { entity, source: userID });
    } else {
      /* Access! */
      const now = core.time();
      const dto = { ...entity };

      // dto.owner0.dtModified = now;
      // core.db.entities(inDB).update(dto);      

      // console.log("inDB before", ecs.toJSON(inDB));

      for (let key in entity) {
        if (!~dontSave.indexOf(key)) {
          inDB[key] = entity[key];
          inDB.saveFile[key] = true;
        }
      }

      await inDB.saveFile.save();

      // console.log("inDB after", ecs.toJSON(inDB));

      if (inDB.located && inDB.located.rel) socket.to(inDB.located.rel, "eu", { entity, source: userID });
      return { code: "ok", id };
    }

    return { code: "ok", id };
  };

  const ioEnter = async ({ rel }, { session }) => {
    const userID = session.connections.user;

    const allowToPublic = [ "VVlZwonDuMKURT3Cs3EVw5" ];

    if (!userID && !~allowToPublic.indexOf(rel)) return { code: "fail", details: "Access denied." };

    /* access !!! */
    const entities = await ecs.loadDirJSON({ dirName: rel });

    return { code: "ok", entities };
  };

  const ioDelete = async ({ entityID, rel }, { session }) => {
    const userID = session.connections.user;
    if (!userID) return { code: "fail", details: "Access denied." };

    /* access !!! */
    try {
      await ecs.erase({ entityID, rel })

      return { code: "ok" };
    } catch(e) {
      log(`Failed to delete [${entityID}]@${rel}`);
      return { code: "fail", details: e };
    }
  };

  return { ioSave, ioEntityExists, ioEnter, ioDelete };
};