module.exports = () => {
  const log = core.makeLog("Mod.webapp0");
  const ioDeploy = async ({ json, target = "dev", webappID, projectID }, { socket, session }) => {
    log("=>", json.length, target, session, webappID, projectID);

    return { code: "in-progress" };
  };

  return { ioDeploy };
};