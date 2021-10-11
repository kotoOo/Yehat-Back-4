module.exports = () => {
  const log = core.makeLog("Mod.main0");

  const ioCompose = async ({ rel, messageBaseID, memberCardID, msg }) => {
    core.bcast({ to: messageBaseID, cmd: 'msg0compose', rel, memberCardID, msg });

    const mBase = ecs.root[messageBaseID];
    if (!mBase) {
      return { code: "fail", details: "Unfamous MessageBase0." };
    }

    if (!rel) {
      return { code: "fail", details: "null rel is not supported." };
    }

    if (!memberCardID) {
      return { code: "fail", details: "Supply an identity." };
    }

    const key = `${memberCardID}@${rel}`;

    if (!mBase.messageBase0.newMessages[key]) {
      const newMessage = await ecs.create("Msg0", {        
        conn: {
          from: memberCardID,
          to: "all",
          rel
        },
        located: {
          rel: mBase.id
        },
        msg0vtm: {
          dtStart: core.time()
        }
      });

      mBase.messageBase0.newMessages[key] = newMessage.id;
      await mBase.saveFile.save();
    }

    // await ecs.load()

    const message = await ecs.get(mBase.messageBase0.newMessages[key], mBase.id);
    message.msg0.msg = msg;
    message.msg0vtm.dtUpdated = core.time();
    message.msg0vtm.updates++;

    await message.saveFile.save();

    return { code: "ok", updates: message.msg0vtm.updates };
  };

  const ioDone = async ({ rel, messageBaseID, memberCardID }) => {
      // core.bcast({ to: messageBaseID, cmd: 'msg0compose', rel, memberCardID });

    const mBase = ecs.root[messageBaseID];
    if (!mBase) {
      return { code: "fail", details: "Unfamous MessageBase0." };
    }

    if (!rel) {
      return { code: "fail", details: "null rel is not supported." };
    }

    if (!memberCardID) {
      return { code: "fail", details: "Supply an identity." };
    }

    const key = `${memberCardID}@${rel}`;
    if (!mBase.messageBase0.newMessages[key]) {
      return { code: "fail", details: "No message being composed." };
    }

    const msg = await ecs.get(mBase.messageBase0.newMessages[key], mBase.id);
    if (!msg.msg0.msg.trim()) {
      return { code: "fail", details: "Empty messages ain't supported." };
    }

    msg.msg0vtm.dtCreated = core.time();
    msg.msg0seenby.roster[memberCardID] = core.time();
    await msg.saveFile.save();

    delete mBase.messageBase0.newMessages[key];
    await mBase.saveFile.save();
    
    core.bcast({ ...msg, to: rel, cmd: 'eu' });

    return { code: "ok" };
  };

  const ioJoin = async ({ rel, messageBaseID, memberCardID }, { socket, session }) => {
    const mBase = ecs.root[messageBaseID];
    if (!mBase) {
      return { code: "fail", details: "Unfamous MessageBase0." };
    }

    if (!memberCardID) {
      return { code: "fail", details: "Supply an identity." };
    }

    const loaded = await ecs.loadDir({ dirName: messageBaseID });

    core.log(`[Mod.msg0]Join Loaded ${Object.keys(loaded)} messages.`);

    const messages = Object.values(loaded).filter((item) => {
      if (item.type !== "Msg0") return false;
      if (item.msg0seenby[memberCardID]) return false;

      return true;
    });

    socket.join(rel);

    core.log("[Mod.msg0]Join", rel, socket.id);
    return { code: "ok", messages };
  };

  const ioLeave = ({ rel }, { socket, session }) => {
    socket.leave(rel);

    // const { deviceID } = session.session0;
    // const userID = session.connections.user;

    // core.log0({ name: "rjoin", deviceID, userID, room, svTime: SVTime(), uptime: UpTime() });
    core.log("[Mod.msg0]Leave", rel, socket.id);
    return { code: "ok" };
  };

  const system = async ({ rel, msg, messageBaseID }) => { /* Adds a system message to a Channel */
    const mBase = ecs.root[messageBaseID];
    if (!mBase) {
      return { code: "fail", details: "Unfamous MessageBase0." };
    }
    const memberCardID = 'C8O6WcOSU8KLRU_CowoobR'; /* Barsuk */

    const newMessage = await ecs.create("Msg0", {   
      msg0: {
        msg,
        type: "system"
      },    
      conn: {
        from: memberCardID,
        rel
      },
      located: {
        rel: mBase.id
      },
      msg0vtm: {
        dtCreated: core.time()
      }
    });
    await newMessage.saveFile.save();

    core.bcast({ ...newMessage, to: rel, cmd: 'eu' });

    return { code: "ok" };
  };

  return { ioCompose, ioDone, ioJoin, ioLeave, system };
};