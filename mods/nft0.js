module.exports = () => {
  const log = core.makeLog("Mod NFT0");
  const ID_LEDGER_0 = "ledger0";
  const ID_TX_POOL_1 = "txpool1";

  // ecs.declaretype("NFT0", [
  //   ecs.compo.nft0(), /* name, blockID */
  //   ecs.compo.nft0payload(), /* stacked [] */
  //   ecs.compo.connections({
  //     owner: null
  //   }),
  //   ecs.compo.saveFile({
  //     nft0: true, nft0payload: true, connections: true
  //   }),
  //   ecs.compo.located({ rel: ID_LEDGER_0 })
  // ]);

  const init = async() => {
    const ledger0 = await ecs.create("Ledger0", {
      id: ID_LEDGER_0
    });

    await ledger0.saveFile.save();

    const entities = await ecs.loadDir({ dirName: ID_LEDGER_0 });

    log("ledger0", ledger0, "entities loaded", Object.keys(entities).length);

    // await ecs.create("Cargo0", {
    //   id: ID_TX_POOL_0
    // }).then(r => r.saveFile.save());

    await ecs.create("Cargo0", {
      id: ID_TX_POOL_1
    }).then(r => r.saveFile.save());
  };

  let ledgerReady = false;

  init().then(() => {
    ledgerReady = true;
  });

  const makeTX = async ({ from, to, id, name, entityID, dtIssued, payload }) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      log("makeTX failed: Payload must be a hashmap (JS: Object).");
      return false;
    }

    if (!entityID) {
      log(`makeTX failed: no entityID.`);
      return false;
    }

    let nft;

    if (id) {
      nft = ecs.root[id];
      if (!nft) {
        log(`makeTX failed: NFT not found ID ${id}.`);
        return false;
      }

      if (nft.nft0.entityID !== entityID) {
        log(`makeTX failed: NFT exists, entityID doesn't match: chain ${nft.nft0.entityID}, tx ${entityID}.`);
        return false;
      }
    } else {
      nft = await ecs.create("NFT0", {
        nft0: { entityID, name },
        connections: { owner: to }
      });
    }

    const tx = await ecs.create("TX1", {
      tx1: { name, dtIssued, json: payload },
      connections: { from, to, nft: nft.id }
    });

    await tx.saveFile.save();
    
    nft.nft0payload.stacked = [ ...nft.nft0payload.stacked, payload ];    
    await nft.saveFile.save();

    log(`[TX]${tx.connections.from} => ${tx.connections.to} [${name}]`);
    return tx;
  };

  const issueNFT0 = async ({ userID, name, entityID, payload }) => {
    if (!userID) {
      log("makeTX failed: Unauthorized.");
      return null;
    }

    const tx = await makeTX({ from: null, to: userID, name, entityID, dtIssued: core.microTime(), payload });
    if (!tx) {
      return null;
    }

    return ecs.root[tx.connections.nft];

      //emitUserBalance({ memberID, name, amount: tp.tp0.amount });
    // }
  };

  const ioResolve = async ({ id }) => {
    let nft = ecs.root[id];
    if (!nft) {
      return { code: "fail", details: "Not found." };
    }

    let payload = {};
    for (let record of nft.nft0payload.stacked) {
      payload = { ...payload, ...record };
    }

    return { code: "ok", payload };
  };

  const ioTXList00 = async ({ filterBy, orderBy }) => {
    const txs = ecs.find(v => v.type === "TX1");

    return { code: "ok", txs };
  };

  const ioIssue = async ({ name, entityID, payload }, { session }) => {
    log("ioIssue", name, payload, session);

    // return { code: "in-progress", details: "In progress." };

    const nft = await issueNFT0({ userID: session.connections.user, name, entityID, payload });

    if (nft === null) {
      return { code: "fail", details: "Failed to generate NFT0." };
    }

    return { code: "ok", nft }; /* ToDo: Dry up. Target: [Standard] */
  };

  return { ioResolve, issueNFT0, ioTXList00, ioIssue };
};