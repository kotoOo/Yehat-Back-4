module.exports = () => {
  const ioSaveCargo = async ({ json, meta, stat, rel }, { session, deviceID }) => {
    const sha256 = require("crypto")
      .createHash("sha256")
      .update(json)
      .digest("hex");

    if (!json || (typeof json !== 'string')) return { code: "fail", details: "No JSON." };
    if (!meta) return { code: "fail", details: "No Meta." };
    if (!stat) return { code: "fail", details: "No Stat." };
    if (!rel) return { code: "fail", details: "No rel." };

    /* access!!! */

    const cargo = await ecs.create("Cargo2", {
      cargo2: {
        rawSize: json.length,
        meta,
        sha256,
        dtDeployed: core.time(),
        by: session.connections.user,
        on: deviceID
      },
      cargo2payload: {
        json,
      },
      cargo2stat: {
        ...stat
      },
      located: { rel }
    });

    await cargo.saveFile.save();
    const { payload, saveFile, ...rest } = cargo;

    core.bcast({ ...rest, to: rel, cmd: "eu" });

    return {
      code: "ok",
      id: cargo.id
    };
  };

  const ioUse = async ({ id, rel }) => {
    const item = ecs.root[id] || await ecs.loadOne(rel, `${id}.json`);
    if (!item) return { code: "fail", details: "Not found." };
    if (!item.cargo2 || !item.cargo2payload) return { code: "fail", details: "Not a Cargo MK 2." };
    
    return { code: "ok", json: item.cargo2payload.json };
  }

  return { ioSaveCargo, ioUse };
};