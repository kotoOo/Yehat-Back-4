module.exports = () => {
  const log = core.makeLog("Mod.main0");

  const enter = ({ socket, session, id }) => {
    log("Enter", socket.id, session.id, id);
    const location = ecs.root[id];
    if (!location) {
      log(`Cannot enter [Location ${id}]: not found.`);
      return false;
    }

    const userID = session.connections.user;
    if (!userID) {
      log(`Cannot enter [${location.meta && location.meta.name || "Unknown"} ${id}]: not authorized.`);
      return false;
    }

    const items = ecs.find(v => v.located && v.located.rel == id);

    socket.emit({ cmd: "eu", ...location }); /* were passing userID here, FOR WHAT ??? */
    for(let item of items) {
      let { cargo2payload, ...rest } =  item; /* exclude components from being broadcasted */

      socket.emit({ cmd: "eu", ...rest }); /* were passing userID here, FOR WHAT ??? */
    }
    socket.join(id);

    // core.emit({ cmd: "eu", userID, ...location });
    // for(let item of items) {
    //   core.emit({ cmd: "eu", userID, ...item });
    // }
    // socket.join(id);

    log(`[User ${userID}] entered [${location.meta && location.meta.name || "Unknown"} ${id}]. Items sent: ${items.length}.`);
    return true;
  };

  const sendAuth = ({ userID, socket }) => {
    if (!ecs.root[userID]) {
      log(`sendAuth() User ${userID} does not exist.`);
      return null;
    }

    if (!ecs.root[userID].user0) {
      log(`sendAuth() User ${userID} does not exist.`);
      return null;
    }

    const { memberID, name, status, level } = ecs.root[userID].user0;

    // const member0 = ecs.compo.member0({
    //   memberID, name, status, level
    // }).member0;
    const dto = { 
      userID, cmd: "auth", id: userID, member0: { memberID, name, status, level } 
    };

    if (socket) {
      socket.emit(dto);
    } else {
      core.emit(dto); /* core tries to find a right socket based on given userID, UNRELIABLE */
    }
  };

  const ioDeviceID = async ({ deviceID, userObject, yehatPass, origin = "nextleveldata" }, { socket, session }) => {
    let SVTime = () => core.microTime() - session.session0.dtStart;
    let UpTime = () => core.microTime() - core.dtStart;

    log("ioDeviceID", deviceID, userObject, yehatPass);

    if (!core.log0) {
      log("Panic, core.log0 down.");
    }
    
    //console.log("1");
    let now = +new Date();    
    if (core.log0) core.log0({ deviceID, name: "deviceID-report-01", socket });
    
    socket.data = {
      ...socket.data,
      deviceID,
      pathPoints: 0
    };


    if (!core.userFromDeviceID) {
      log("Panic, core.userFromDeviceID down.");
      return { code: "fail" };
    }

    /* We are to locate onlineStat0 which we want to update. */
    /* As we see, it is not available at the point of mod loaded. But we are
    now in the handler of DIOMI protocol! No worries, it will be loaded before the
    first message starts to be piped though here. */
    /* ...but how do I get to there? =^_^= */
    log("Trying to locate onlineStat0...");
    const onlineStat0 = ecs.root["asKIOU_CjC9Dw6HCpCNlw6"];

    if (onlineStat0) {
      console.log("onlineStat0 located:", onlineStat0);
    } else {
      log("Panic, onlineStat0 can't be located.");
    } 

    let user = core.userFromDeviceID(deviceID);
    if (user) {
      socket.data.userID = user.id;
      socket.data.sessonID = core.uuid();

      // if (user.type == 'user0' && userObject && userObject.first_name != undefined) {
      //   core.treasure.upgradeUser0ToUser1(user, userObject);
      // }
      
      if (user.type == "user1") {
        log(`Connected user ${user.user0.name} (${user.id})`);
      } else {
        log("Connected user: by deviceID", user.id, user.type);
      }
      user.user0.sessionID = socket.data.sessonID;
      user.user0vtm.socketID = socket.id;
      user.user0vtm.dtSessionStart = now;
      user.user0vtm.dtLastActivity = now;
      user.user0vtm.online = true;
      user.saveFile.save();

      if (onlineStat0) {
        onlineStat0.stat0.value.guest--;
        onlineStat0.stat0.value.user++;
      }

      session.connections.user = user.id;

      core.bcast({ to: onlineStat0.id, cmd: "eu", id: onlineStat0.id, stat0: onlineStat0.stat0 });
      //socket.join(user.id);
      

      sendAuth({ userID: user.id, socket });

      while(!core.mods.tp) await core.ms(50);
      await core.mods.tp.emitFullUserBalance({ memberID: user.id });

      await ecs.loadDir({ dirName: user.id });
      enter({ socket, session, id: user.id });
      enter({ socket, session, id: "public-root" });

      return { 
        code: "ok", 
        // member: { id: user.id, member0: { memberID: user.user0.memberID, name: user.user0.name, status: user.user0.status, level: user.user0.level } },
        // passwords: password ? [ password ] : []
      };
    } else {
      /* UNFAMOUS USER => CREATE => MINE ONE FRAME NFT? */

      /* OBSOLETE? 1. Create user based on userObject */
      if (userObject && userObject.first_name != undefined) {
        const user1 = core.treasure.makeUser1({ deviceID, socketID: socket.id, userObject });
        console.log("makeUser1", user1);
        user1.save();
        core.log0({ name: "user-created", type: "user1", deviceID, userID: user0.id, svTime: SVTime(), uptime: UpTime() });

        if (onlineStat0) {
          onlineStat0.stat0.value.guest--;
          onlineStat0.stat0.value.user++;
        }

        core.bcast({ to: onlineStat0.id, cmd: "eu", id: onlineStat0.id, stat0: onlineStat0.stat0 });

        session.connections.user = user1.id;
        socket.join(user1.id);
        sendAuth({ userID: user1.id, socket });

        return { code: "ok" }; //, member: { id: user1.id, member0: { memberID: user1.user0.memberID, name: user1.user0.name, status: user1.user0.status, level: user1.user0.level } } };
      } else {
      /* NORMAL 2. Create just User0 */
        const now = core.microTime();
        const user0 = await ecs.create("User0", { 
          user0: { deviceIDs: [ deviceID ], origin },
          user0vtm: {
            socketID: socket.id,
            dtCreated: now,
            dtSessionStart: now,
            dtLastActivity: now,
            online: true
          }
        });
        
        // const user0 = core.treasure.makeUser0({ deviceID, socketID: socket.id, userID: userObject.user_name });
        await user0.saveFile.save();

        core.log0({ name: "user-created", type: "user0", deviceID, userID: user0.id, svTime: SVTime(), uptime: UpTime() });
        if (onlineStat0) {
          onlineStat0.stat0.value.guest--;
          onlineStat0.stat0.value.user++;
        }
        log(`<= ok member: `, { id: user0.id, member0: { memberID: user0.user0.memberID, name: user0.user0.name, status: user0.user0.status, level: user0.user0.level } });

        core.bcast({ to: onlineStat0.id, cmd: "eu", id: onlineStat0.id, stat0: onlineStat0.stat0 });

        session.connections.user = user0.id;
        socket.join(user0.id);
        sendAuth({ userID: user0.id, socket });

        return { code: "ok" };
        // , member: { id: user0.id, member0: { memberID: user0.user0.memberID, name: user0.user0.name, status: user0.user0.status, level: user0.user0.level } } };
      }
      // reply({ code: "ok", user0 });
    }    
  };

  const ioSaveEntity = ({ entity = {}, access = "private" }, { socket, userID, sessionID }) => {
    console.log("=> save entity", entity, userID, sessionID);

    if (!entity.id) entity.id = core.uuid();

    const exists = core.db.entities({ id: entity.id }).get().length;

    console.log("..:", exists ? "Exists" : "Doesn't Exist");
    const { owner0 } = ecs.compo;
    if (!exists) {
      const item = {
        ...entity,
        ...owner0({ userID, access })
      };
      core.db.entities.insert(item);
    }

    return { code: "ok", id: entity.id };
  };

  const ioByOwner = ({ userID: lookForUserID_ = null }, { socket, userID, sessionID }) => {
    /* returns entities by owner */
    const lookForUserID = lookForUserID_ ? lookForUserID_ : userID; /* Default: MINE */

    const entities = core.db.entities({ owner0: { userID: lookForUserID } }).get();
    return { code: "ok", entities };
  };

  const ioUpdate = ({ id, ...rest }, { socket, userID, sessionID }) => {
    /* let's find out what is this */
    const inDB = core.db.entities({ id }).get()[0];
    const now = core.time();

    if (inDB) {
      if (
        inDB.owner0 && inDB.owner0.userID == userID || /* Update my own entity */
        inDB.owner0 && inDB.owner0.access == "public" /* Update public entity */
      ) {        
        const dto = { ...ecs.compo.owner0({ userID }), ...rest };
        dto.owner0.dtModified = now;
        core.db.entities({ id }).update(dto);
        return { code: "ok" };
      } else {
        return { code: "fail", details: "No access." };
      }
    } else {
      return { code: "fail", details: "No exists." };
    }
  };

  const ioGetPublicRoot = ({}, { socket, userID, sessionID }) => {
    const entities = ecs.find(item => item.located && item.located.rel == "public-root")
    // const entities = core.db.entities(function() { 
    //   const item = this;
    //   if (
    //     item.owner0 && item.owner0.access == 'public' && 
    //     (!item.located || item.located.rel === null)
    //   ) return true;
    //   return false;
    // }).get();

    return { code: "ok", entities };
  };

  const ioCreatePassword = async ({ name, email, promo }, { session }) => {
    const user = session.c.user;
    if (!user) {
      log("ioCreatePassword: No user record found", session, session.c);
      return { code: "error", details: "No user record found." };      
    }

    const passwords = ecs.find(v => v.password0 && v.password0.valid && v.connections.owner == session.connections.user);

    if (passwords.length >= 1) {
      return { code: "locked", details: "You have got maximum 1/1 passwords attached to your account." };
    }

    // user.user0secrets.password = core.randomHex8();
    user.user0.name = name;
    user.user0.email = email;
    user.user0.proto = promo;

    if (user.user0.level == 0) user.user0.level = 1; /* Promoted, but silent at the moment */

    user.saveFile.save();

    const password = await ecs.create("Password0", {
      password0: {
        password: core.randomHex8(),
        valid: true
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

  const ioInvalidatePassword = async ({ password }, { session }) => {
    const user = session.c.user;
    if (!user) {
      log("ioCreatePassword: No user record found", session, session.c);
      return { code: "error", details: "No user record found." };      
    }

    const pwds = ecs.find(v => v.password0 && v.connections.owner == user.id && v.password0.password === password);
    if (!pwds.length) {
      log(`ioCreatePassword: [User ${user.id}] Password not found`, password);
      return { code: "error", details: "Password not found." };      
    }

    if (!pwds[0].password0.valid) {
      log(`ioCreatePassword: [User ${user.id}] Password is not valid already`, password);
      return { code: "error", details: "The password is not valid already." };
    }
    
    pwds[0].password0.valid = false;
    pwds[0].saveFile.save();

    core.emit({ userID: user.id, cmd: "eu", 
      ...pwds[0]
    });

    return { code: "ok" };
  };

  ecs.define("evotp0", {
    email: "",
    code: "",
    dtIssued: null, /* Unix */
    dtExpired: null, /* Unix */
    dtSent: null,
    dtUsed: null,
    used: false,
  });

  ecs.declareType("EmailOTP0", [
    ecs.compo.evotp0(),
    ecs.compo.located(),
    ecs.compo.connections({
      ticket: null,
      member: null
    }),
    ecs.compo.saveFile({
      evotp0: true, located: true, connections: true
    })
  ], { details: "Email Verification OTP." });

  const ioCreateEVOTP = async ({ ticket }, { session }) => {
    const ID_CARGO_OTPS_0 = "otps0";

    try {
      const memberID = session.connections.user;
      if (!memberID) throw("Not authorized.");

      const { id: ticketID, ticketMemberCard0 } = ticket;
      const { email } = ticketMemberCard0;

      if (!email) throw("Please enter Email address.");

      if (!ticketID) throw("Need a ticket.");

      await ecs.loadDir({ dirName: ID_CARGO_OTPS_0 });
      const exists = ecs.find(v => 
        v.evotp0 && v.evotp0.email === email && 
        v.connections.ticket === ticketID && v.connections.member === memberID
      );
      if (exists.length) {
        const id = exists[0].id;
        await ecs.erase({ entityID: id, rel: exists[0].located.rel });
        core.log(`[Main0.ioCreateEVOTP] Deleted old [EmailOTP0 ${id}].`);
      }

      const code = core.randomHex8();
      const validPeriod = 60 * 60; /* 1 hour */

      
      const otp = await ecs.create("EmailOTP0", {
        evotp0: {
          email, code, dtIssued: core.time(), dtExpired: core.time() + validPeriod
        },
        located: {
          rel: ID_CARGO_OTPS_0
        },
        connections: {
          ticket: ticketID,
          member: memberID
        }
      });
      await otp.saveFile.save();

      await core.mods.mailer.send({ to: email, subject: "Yehat Member Card - Verification code", html: `
        <h1 style="font-size: 20px; font-family: Tahoma; color: #1a0f11;">Use this code to confirm that this E-Mail does belong to you:</h1>
        <h2 style="font-size: 48px; font-family: Tahoma; color: #1a0f11; text-align: center; padding: 20px;">
          ${code}
        </h2>
        <p style="font-size: 10px; color: #8b9bb4; font-family: Tahoma;">
          This letter was sent to you automatically from Yehat Server. You don't need to reply this letter.
          If you don't know anything about Yehat, please just ignore this letter.
        </p>
      `});

      otp.evotp0.dtSent = core.time();
      await otp.saveFile.save();

      return { code: "ok" };
      /* send! */
      // core.bcast({ to: memberID, cmd: "eu" })

    } catch(e) {
      core.log("[Main0.ioCreateEVOTP] Error", e);
      return { code: "fail", details: e.message || e };
    }
  };

  const ioConfirmEVOTP = async ({ ticket }, { session, socket }) => {
    const ID_CARGO_OTPS_0 = "otps0";

    try {
      const memberID = session.connections.user;
      if (!memberID) throw("Not authorized.");

      const { id: ticketID, ticketMemberCard0 } = ticket;
      if (!ticketID) throw("Need a ticket.");

      const theTicket = ecs.root[ticketID];
      if (!theTicket) throw("Ticket not found.");
      if (theTicket.ticket0status.used) throw("Ticket is used already.");

      const { otpEntered, name, email, tosAccepted } = ticketMemberCard0;

      if (!otpEntered) throw("Please enter one-time code from the email.");

      if (!name) return { code: "step", value: 1, details: "Enter you name please." };
      if (!email) return { code: "step", value: 1, details: "Enter you e-mail please." };
      if (!core.validateEmail) return { code: "step", value: 1, details: "Server has rejected this E-Mail address." };
      if (!tosAccepted) return { code: "step", value: 1, details: "You have to accept Terms of Service to proceed." };

      await ecs.loadDir({ dirName: ID_CARGO_OTPS_0 }); /* Must gone in favor of _at_least_ await code.mods.ledger.ready() */
      
      const exists = ecs.find(v => 
        v.evotp0 && v.evotp0.email === email && 
        v.connections.ticket === ticketID && v.connections.member === memberID &&
        v.evotp0.used === false
      );
      if (!exists.length) {
        return { code: "step", value: 1, details: "One-time password not found, please try again." };
      }

      const evOTP = exists[0];
      const { code, dtExpired } = evOTP.evotp0;
      
      if (code !== otpEntered) {
        return { code: "step", value: 2, details: "The code not matched!. Please try to enter code manually, don't COPY/PASTE." };
      }

      if (core.time() > dtExpired) {
        return { code: "step", value: 1, details: "This one-time password looks expired. Please try to create and use a new one." }; 
      }

      /* looks good */
      log("ConfirmEVOTP looks good, creating MemberCard!");

      const memberCard = await ecs.create("MemberCard0", {
        memberCard0: {
          name, email, dtCreated: core.time()
        },
        nft0payload: {
          stacked: [
            { memberID, name, email }
          ]
        },
        connections: {
          owner: memberID,
          ticket: ticketID
        },
        located: {
          rel: memberID
        }
      });

      const tx = await ecs.create("TX1", {
        tx1: {
          json: JSON.stringify({ nft0: memberCard.ntf0, nft0payload: memberCard.nft0payload }),
          dtIssued: core.time()
        },
        connections: {
          from: null,
          to: memberID,
          ntf: memberCard.id
        }
      });

      memberCard.connections.tx = tx.id;

      await memberCard.saveFile.save();
      await tx.saveFile.save();

      /* update User0 */

      const user = session.c.user;
      if (user.user0.name === "noname") {
        user.user0.name = name;
      }
      user.user0.level = 1;
      user.user0.memberID = user.id;
      await user.saveFile.save();

      sendAuth({ userID: user.id, socket });

      /* mark out OTP */
      evOTP.evotp0.used = true;
      evOTP.evotp0.dtUser = core.time();
      await evOTP.saveFile.save();

      /* mark out Ticket */
      // theTicket.located.rel = "used-tickets";
      theTicket.ticket0status.used = true;
      theTicket.ticket0status.dtUsed = core.time();
      await theTicket.saveFile.save();

      core.bcast({ to: memberID, cmd: "eu", ...JSON.parse(ecs.toJSON(memberCard)) });
      core.bcast({ to: memberID, cmd: "eu", ...JSON.parse(ecs.toJSON(theTicket)) });
 
      return { code: "ok" };      
    } catch(e) {
      console.trace("[Main0.ioCreateEVOTP] Error", e);
      return { code: "fail", details: e.message || e };
    }
  };

  const ioCreateTicketMemberCard0 = async ({ memberID, projectID = null, eventID = null }, { session }) => {
    if (!memberID) return { code: "fail", details: "memberID required." };
    
    const ticket = await ecs.create("TicketMemberCard0", {
      ticket0status: {
        dtIssued: core.time(),
      },
      located: {
        rel: memberID
      },
      connections: {
        project: projectID,
        owner: memberID,
        event: eventID
      }
    });

    await ticket.saveFile.save();

    core.bcast({ ...JSON.parse(ecs.toJSON(ticket)), to: memberID, cmd: "eu" });

    return { code: "ok" };
  };

  return {
    ioDeviceID, ioSaveEntity, ioByOwner, ioUpdate, ioGetPublicRoot, ioCreatePassword, ioInvalidatePassword,
    ioCreateEVOTP, ioConfirmEVOTP, ioCreateTicketMemberCard0, enter
  };
};