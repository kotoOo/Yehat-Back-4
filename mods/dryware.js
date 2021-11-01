module.exports = () => {
  const ioCreatePassword = async ({}, { session }) => {
    // const { inspect } = require("util");
    // console.log("create password", inspect(session));



    const user = session.c.user;
    if (!user) {
      log("ioCreatePassword: No user record found", session, session.c);
      return { code: "error", details: "No user record found." };      
    }

    const passwords = ecs.find(v => v.password0 && v.password0.valid && v.connections.owner == session.connections.user);

    if (passwords.length >= 3) {
      return { code: "locked", details: "You have got maximum 3/3 passwords attached to your account." };
    }

    // user.user0secrets.password = core.randomHex8();
    // user.user0.name = name;
    // user.user0.email = email;
    // user.user0.proto = promo;

    // if (user.user0.level == 0) user.user0.level = 1; /* Promoted, but silent at the moment */

    // user.saveFile.save();

    const password = await ecs.create("Password0", {
      password0: {
        password: core.randomHex8(),
        valid: true,
        on: session.session0.deviceID
      }, 
      connections: {
        owner: user.id
      },
      located: { rel: user.id }
    });
    await password.saveFile.save();

    core.emit({ userID: user.id, cmd: "eu", 
      ...password
    });

    return { code: "ok" };
  };

  return { ioCreatePassword };
};