// const { ecs } = require("../yehat/ecs.cjs");

/* The official place for definitions, until we'll get GUI-powered DDD rails, */
/* of Proto Grade.                                                            */
/* But no order guarantee here, they could load before other mods or after.   */
/* We are not supposed to do anything imperative here.                        */

const ID_LEDGER_0 = "ledger0";
const ID_TX_POOL_0 = "txpool0";
const ID_TX_POOL_1 = "txpool1";

ecs.define("tp0", {
  name: "nothingness",
  amount: 0
}, { details: "Yehat TP Component." });

ecs.define("nft0", {
  entityID: null, /* One NFT per entityID! */
  name: "nothingness",
  blockID: 0
}, { details: "Yehat NFT Component." });

ecs.define("nft0payload", {
  stacked: []
}, { 
  details: "Yehat NFT Payload: arbitrary. Add things to `stacked` to make them blockchain-friendly." 
});

ecs.define("tx0", { /* TPs */
  name: "",
  amount: 0,
  blockID: 0,
  dtIssued: 0,
  dtMined: 0
}, { details: "Mineable Transaction for TPs" });

ecs.define("tx1", { /* NFT */
  json: "",
  blockID: 0,
  dtIssued: 0,
  dtMined: 0
}, { details: "Mineable Transaction for NFTs" });

ecs.declareType("TX0", [
  ecs.compo.tx0(),
  ecs.compo.connections({
    from: null,
    to: null
  }),
  ecs.compo.located({
    rel: ID_TX_POOL_0
  }),
  ecs.compo.saveFile({
    tx0: true, connections: true, located: true
  })
]);

ecs.declareType("TX1", [
  ecs.compo.tx1(),
  ecs.compo.connections({
    from: null,
    to: null,
    nft: null,
    // passive: true
  }),
  ecs.compo.located({
    rel: ID_TX_POOL_1
  }),
  ecs.compo.saveFile({
    tx1: true, connections: true, located: true
  })
]);

// console.log("COMPONENTS SO FAR", Object.keys(ecs.compo));
// console.log("tp0", ecs.compo.tp0());

ecs.declareType("TP0", [
  ecs.compo.tp0(),
  ecs.compo.connections({
    owner: null               /* must have owner connection to ~something with user0 component? */
                              /* how about projects as owners of tokens? vds? come on =^_^= */
  }),
  ecs.compo.saveFile({
    tp0: true, connections: true
  }),
  ecs.compo.located({ rel: ID_LEDGER_0 })
], { details: "Yehat TP" });

ecs.declareType("NFT0", [
  ecs.compo.nft0(), /* name, blockID */
  ecs.compo.nft0payload(), /* stacked [] */  
  ecs.compo.connections({
    owner: null
  }),
  ecs.compo.saveFile({
    nft0: true, nft0payload: true, connections: true
  }),
  ecs.compo.located({ rel: ID_LEDGER_0 })
]);


ecs.define("memberCard0", {
  name: "",
  email: "",
  dtCreated: null
}, { details: "MemberCard0 data component." });

ecs.declareType("MemberCard0", [
  ecs.compo.memberCard0(),
  ecs.compo.nft0({ /* => HOLOCHAIN */
    name: "MemberCard0"
  }),
  ecs.compo.nft0payload({ /* => HOLOCHAIN */
    stacked: []
  }),
  ecs.compo.connections({
    owner: null,
    ticket: null,
    tx: null
  }),
  ecs.compo.located(),
  ecs.compo.saveFile({
    memberCard0: true, nft0: true, nft0payload: true, connections: true, located: true
  })
], { details: "MemberCard0 NTF" });

// ---

  // const koto = ecs.find(v => v.member0 && v.id == "");

  // sunlight = ecs.create("TP0", {
  //   tp0: {
  //     name: "sunlight",             // sunlight => SunLight
  //     amount: 20,
  //     blockID: 1
  //   },
  //   connections: {
  //     owner: koto
  //   }
  // })


/* FORMAT */
/*
  DD-MM-YYYY    25-08-2021
  MM/DD/YYYY    08/25/2021
  YYYY/MM/DD    2021/08/25
*/

/* CONVERSION */
/*
                    FORMAT: DD-MM-YYYY
  X (2021/08/25) => [ ...OUTPUT?... ] => "25-08-2021"

*/

/* JSON */
/*
  Types:
  1. Number -> plain                                        Example: 25    => 25
  2. String (piece of text) -> double quote ("")            Example: Puma  => "Puma"
          if have doubleqoute inside your text, you must
          "replace" -> (" -> /")                            Example: "Mouse" => "\"Mouse\""
  3. Array -> square bracket ([])                           Example: 3, 5, Puma => [ 3, 5, "Puma" ]
  4. Object (hashmap) -> curly bracket ({})                 Example: name=Puma color=Red => { name: "Puma", color: "red" }
        name of variable -> plain : (semicolon)                                             { name: "Koto", color: "white" }
        value -> see rules above 
  5. null    (means Nothing)                                Example: { name: "Puma", helicopter: null }
  
  



*/



module.exports = () => {
  const log = core.makeLog("Mod TP");

  const init = async() => {
    const ledger0 = await ecs.create("Ledger0", {
      id: ID_LEDGER_0
    });

    await ledger0.saveFile.save();

    const entities = await ecs.loadDir({ dirName: ID_LEDGER_0 });

    log("ledger0", ledger0, "entities loaded", Object.keys(entities).length);

    await ecs.create("Cargo0", {
      id: ID_TX_POOL_0
    }).then(r => r.saveFile.save());

    await ecs.create("Cargo0", {
      id: ID_TX_POOL_1
    }).then(r => r.saveFile.save());
  };

  let ledgerReady = false;

  init().then(() => {
    ledgerReady = true;
  });

  const makeTX = async ({ from, to, name, amount, dtIssued }) => {
    const tx = await ecs.create("TX0", {
      tx0: { name, amount, dtIssued },
      connections: { from, to }
    });

    await tx.saveFile.save();

    log(`[TX]${tx.connections.from} => ${tx.connections.to} [${name}] x${amount}`);
    return tx;
  };

  const emitUserBalance = ({ memberID, name, amount }) => {
    core.bcast({ to: memberID, cmd: "balance", id: memberID, name, amount });
  };

  /* Usage tracking: Mod.main0 -> 1 */
  const emitFullUserBalance = async ({ memberID }) => {
    while(!ledgerReady) await core.ms(50);
    const tps = ecs.find(v => v.tp0 && v.connections.owner === memberID);
    const roster = {};
    for(let tp of tps) {
      if (roster[tp.tp0.name]) log("ALERT duplicate TPs!", tp.id, tp.tp0.name, "memberID", memberID);
      roster[tp.tp0.name] = tp.tp0.amount;
    }

    log(`emitFullUserBalance => [Member ${memberID}]`);
    console.table(roster);

    core.bcast({ to: memberID, cmd: "balanceRoster", id: memberID, roster });
  };

  const issueTP = async ({ memberID, name, amount = 1 }) => {
    const tp0 = ecs.find(v => v.tp0 && v.connections.owner === memberID && v.tp0.name === name && v.located.rel == ID_LEDGER_0);
    console.log("tp0", tp0);

    if (tp0.length) {
      const ex = tp0[0];
      ex.tp0.amount = ex.tp0.amount + amount;
      ex.saveFile.save();

      await makeTX({ from: null, to: memberID, name, amount, dtIssued: core.microTime() });
      emitUserBalance({ memberID, name, amount: ex.tp0.amount });
    } else {
      const tp = await ecs.create("TP0", {
        tp0: { name, amount },
        connections: { owner: memberID }
      });
      await tp.saveFile.save();

      await makeTX({ from: null, to: memberID, name, amount, dtIssued: core.microTime() });

      emitUserBalance({ memberID, name, amount: tp.tp0.amount });
    }
  };

  const ioIssueTP = async ({ name, amount }, { session }) => {
    while(!ledgerReady) await core.ms(50);

    const memberID = session.connections.user;
    if (!memberID) {
      return { code: "fail", details: "Not authorized." };
    }

    await issueTP({ memberID, name, amount });

    return { code: "ok" };
  };

  

  return { ioIssueTP, emitFullUserBalance, issueTP };
};
