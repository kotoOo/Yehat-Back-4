const ID_FAUCETS_0 = "faucets0";  /* from boot/01-local-storage */

ecs.define("faucet0", {
  payload: [],
  dtCreated: null,
  dtLastUsed: null,
  chargesMax: 1,
  charges: 1,
  password: null,
  usedBy: []
}, { details: "Item Faucet MK 0" });

ecs.declareType("Faucet0", [
  ecs.compo.faucet0(),
  ecs.compo.located({ rel: ID_FAUCETS_0 }),
  ecs.compo.saveFile({ faucet0: true, located: true }),
  ecs.compo.meta({ type: "Faucet0", name: "Item Faucet MK 0" })
]);

module.exports = () => {
  const log = core.makeLog("Mod.faucet");

  // const app = core.mods.express.app;
  //app.post("/api/su/createFaucet", async (req, res) => {
  const ioCreateFaucet = async ({ charges, password = null, payload }, { session }) => {
    if (!payload) return { code: "fail", details: "No payload." };
    if (!Array.isArray(payload)) return { code: "fail", details: "Supply [] for the payload please." };

    const faucet = await ecs.create("Faucet0", {
      faucet0: {
        payload, charges, chargesMax: charges, password, dtCreated: core.time(),
      }
    });

    await faucet.saveFile.save();

    return { code: "ok", faucetID: faucet.id };
  };

  const ioCreateMCT0Faucet = async ({ charges, password = null }, { session }) => {
    // if (!payload) return { code: "fail", details: "No payload." };
    // if (!Array.isArray(payload)) return { code: "fail", details: "Supply [] for the payload please." };
    const payload = [
      {
        type: "TicketMemberCard0",
        ticket0status: {
          dtIssued: core.time(),
        },
        located: {
          rel: "YFS0:[memberID]" /* Yehat Faucet Slot 0 */
        },
        connections: {
          project: null,
          owner: "YFS0:[memberID]",
          event: null
        }
      }
    ];

    const faucet = await ecs.create("Faucet0", {
      faucet0: {
        payload, charges, chargesMax: charges, password, dtCreated: core.time(),
      }
    });

    await faucet.saveFile.save();

    return { code: "ok", faucetID: faucet.id };
  };
  // });

  const ioUseFaucet = async ({ id, password }, { session, socket }) => {
    console.log("ioUseFaucet", id, password);
    const memberID = session.connections.user;
    if (!memberID) return { code: "fail", details: "Access denied" };


    const faucet = await ecs.loadOne(ID_FAUCETS_0, `${id}.json`);
    if (!faucet) {
      return { code: "fail", details: "Faucet not found." };
    }

    const { charges, payload, usedBy } = faucet.faucet0;

    if (!charges) {
      return { code: "depleted", details: "Faucet depleted." };
    }

    if (password != faucet.faucet0.password) {
      return { code: "fail", details: "Access denied." };
    }

    if (~usedBy.indexOf(memberID)) {
      return { code: "fail", details: "Items were obtained already." };
    }

    let items;
    let processedPayload;

    /* Substitute memberID instead of YFS0:[memberID] meta tokens */
    try {
      processedPayload = JSON.parse(JSON.stringify(payload).split("YFS0:[memberID]").join(memberID));
    } catch(e) {
      return { code: "ok", details: "Faucet broken." };
    }

    faucet.faucet0.charges--;
    faucet.faucet0.dtLastUsed = core.time();
    faucet.faucet0.usedBy.push(memberID);
    faucet.saveFile.save(); 

    console.log("processed payload");
    console.table(processedPayload);

    try {
      items = await ecs.boot(processedPayload);
      console.log("after boot", items);
    } catch(e) {
      return { code: "fail", details: "Faucet broken." };
    }

    if (!items.length) return { code: "ok", details: "Nothing happened." };

    let saved = 0;
    /* Save and announce */
    for(let item of items) {
      if (!item.saveFile) continue;

      await item.saveFile.save();
      socket.emit({ ...JSON.parse(ecs.toJSON(item)), cmd: "eu" });

      saved++;
    }

    log(`[Faucet ${id} ] used normally, ${saved} items saved.`);

    return { code: "ok" };
  };

  const ioTest = (id) => {
    console.log("!!!", "test", id);
    return { code: "ok", id };
  };

  return { ioUseFaucet, ioCreateFaucet, ioCreateMCT0Faucet, ioTest };
};