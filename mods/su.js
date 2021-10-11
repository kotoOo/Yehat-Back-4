module.exports = () => {
  const ioJoin = ({ room }, { socket, session }) => {
    socket.join(room);

    // const { deviceID } = session.session0;
    // const userID = session.connections.user;

    // core.log0({ name: "rjoin", deviceID, userID, room, svTime: SVTime(), uptime: UpTime() });
    core.log("[Mod.su]Join", room, socket.id);
    return { code: "ok" };
  };

  const ioLeave = ({ room }, { socket, session }) => {
    socket.leave(room);

    // const { deviceID } = session.session0;
    // const userID = session.connections.user;

    // core.log0({ name: "rjoin", deviceID, userID, room, svTime: SVTime(), uptime: UpTime() });
    core.log("[Mod.su]Leave", room, socket.id);
    return { code: "ok" };
  };

  return { ioJoin, ioLeave };
};