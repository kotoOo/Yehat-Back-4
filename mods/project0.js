const { ecs } = require("../yehat/ecs.cjs");

module.exports = () => {
  // ecs.define("owner0", {
  //   memberID: null,
  //   access: "private"
  // }, { details: "Entity Ownership" });
  const log = core.makeLog("Mod.project0"); 

  const ioRegister = async({ id, ...a }, { socket, session }) => {
    if (await ecs.exists({ id, rel: "public-root" })) { /* MONKEYS! */

      if (session.connections.user === "I8K7wrTDkMKOw45Hw5HCl8") { /* Short hack to register first projects for free */
        const project = ecs.root[id];
        project.project0status = { dtRegistered: core.microTime(), founderID: session.connections.user };
        project.saveFile.save();

        core.bcast({ to: "public-root", cmd: "eu", ...(project) });
      }

      return { code: "ok" };
    }

    const memberID = session.connections.user;
    if (!memberID) {
      return { code:"auth", details:"Access denied." };
    }

    const project = await ecs.create("Project", {
      id,
      ...a,
      located: { rel: "public-root" },
      project0status: { dtRegistered: core.microTime(), founderID: memberID },
      connections: {
        owner: memberID
      }
    });
    await project.saveFile.save();

    core.bcast({ to: "public-root", cmd: "eu", ...project });
    return { code: "ok" };
  };

  const ioDeploy = async({ id, projectID, webappID, json, target }, { session }) => {
    log("Deploy projectID, webappID, json, target", projectID, webappID, json ? json.length : null, target);
    const project = ecs.root[projectID];
    if (!project) {
      return { code: "fail", details: "Project not found." };
    }

    await ecs.loadDir({ dirName: projectID });

    let webapp = ecs.root[webappID];
    if (!webapp) {
      webapp = await ecs.create("WebApp0", { 
        id: webappID, 
        connections: {
          project: projectID
        },
        located: {
          rel: projectID
        }
      });

      await webapp.saveFile.save();
    }

    const sha256 = require("crypto")
      .createHash("sha256")
      .update(json)
      .digest("hex");

    log("sha256", sha256);

    await ecs.loadDir({ dirName: webappID });

    const pastDeployments = ecs.find(
      v => v.deployment0 && v.connections.project === projectID && v.connections.webapp === webappID
    );

    log("past deployments", pastDeployments.length);

    for(let item of pastDeployments) {
      if (item.deployment0.sha256 === sha256) {
        return { code: "matched", deploymentID: item.id, dtDeployed: item.deployment0.dtDeployed, target: item.deployment0.target };
      }
    }

    /* No more excuses, we start to write down the deployment */

    /* Cancel out any past deployment with the same target */
    // pastDeployments.map(item => {
    //   if (item.deployment0.target === target) {
    //     item.deployment0.target = null;
    //     item.saveFile.save();
    //   }
    // });

    const dep = await ecs.create("Deployment0", {
      deployment0: {
        json, sha256, dtDeployed: core.microTime()
      },
      connections: {
        project: projectID,
        webapp: webappID
      },
      located: {
        rel: webappID
      }
    });
    await dep.saveFile.save();

    webapp.connections[target] = dep.id;
    await webapp.saveFile.save();

    let memberID = session.connections.user;
    if (memberID) {
      core.mods.tp.issueTP({ memberID, name: "moonlight" });
    }

    return { code: "ok", dtDeployed: dep.deployment0.dtDeployed, deploymentID: dep.id, target };
  };

  const ioGetDeployRoster = async ({ projectID, webappID }, { session }) => {
    await ecs.loadDir({ dirName: projectID });
    await ecs.loadDir({ dirName: webappID });

    const webapp = ecs.root[webappID];
    if (!webapp) {
      return { code: "fail", details: "Webapp not found." };
    }

    const all = ecs.find(v => v.located && v.located.rel == webappID);

    const pipeline = [
      (items) => {
        return items.map(item => {
          const { dtDeployed, sha256 } = item.deployment0;
          const targets = [];
          if (webapp.connections.dev === item.id) targets.push("dev");
          if (webapp.connections.prod === item.id) targets.push("prod");

          return {
            id: item.id,
            dtDeployed, sha256, targets, size: item.deployment0.json.length
          };
        });
      }
    ];

    const output = pipeline.reduce((a, v) => v(a), all);

    return {
      code: "ok",
      roster: output
    };
  };

  const ioGetDeployment = async ({ projectID, webappID, target, deploymentID, sha256 }, { session }) => {
    const project = ecs.root[projectID];
    if (!project) {
      return { code: "fail", details: "Project not found." };
    }

    await ecs.loadDir({ dirName: projectID });

    const webapp = ecs.root[webappID];
    if (!webapp) {
      return { code: "fail", details: "Webapp not found." };
    }

    await ecs.loadDir({ dirName: webappID });

    // const all = ecs.find(v => v.located && v.located.rel == webappID && v.deployment0 && ~v.deployment0.targets.indexOf(target));
    if (target) {
      const inWebapp =  webapp.connections[target];
      if (inWebapp) {
        const deployment = ecs.root[webapp.connections[target]];
        if (!deployment) return { code: "fail", details: `No deployment found for target ${target}.` };
        if (deployment.deployment0.sha256 === sha256) return { code: "same" };
        return { code: "ok", json: deployment.deployment0.json };
      } else {
        return { code: "fail", details: `No deployment found for target ${target}.` };
      }
    } else if (deploymentID) {
      const deployment = ecs.root[deploymentID];
      if (deployment) {
        if (deployment.deployment0.sha256 === sha256) return { code: "same" };
        return { code: "ok", json: deployment.deployment0.json };
      } else {
        return { code: "fail", details: `[Deployment ${deploymentID}] not found.` };
      }
    }
  };

  const ioSetDeploymentTarget = async ({ projectID, webappID, deploymentID, target }) => {
    const project = ecs.root[projectID];
    if (!project) {
      return { code: "fail", details: "Project not found." };
    }

    await ecs.loadDir({ dirName: projectID });

    const webapp = ecs.root[webappID];
    if (!webapp) {
      return { code: "fail", details: "Webapp not found." };
    }

    await ecs.loadDir({ dirName: webappID });

    const deployment = ecs.root[deploymentID];
    if (!deployment) {
      return { code: "fail", details: "Deployment not found." };
    }

    webapp.connections[target] = deploymentID;
    await webapp.saveFile.save();

    return { code: "ok" };
  };

  const ioEnter = async ({ rel }, { session, socket }) => {
    const project = ecs.root[rel];
    if (!project || project.type !== "Project") {
      return { code: "fail", details: "Not a Project." };
    }

    await ecs.loadDir({ dirName: rel });
    core.mods.main0.enter({ socket, session, id: rel });

    // mods.main0.enter({ socket, session, id: rel });
    // const userID = session.connections.user;

    // const allowToPublic = [ "VVlZwonDuMKURT3Cs3EVw5" ];

    // if (!userID && !~allowToPublic.indexOf(rel)) return { code: "fail", details: "Access denied." };

    // /* access !!! */
    // const entities = await ecs.loadDirJSON({ dirName: rel });

    // return { code: "ok", entities };
    return { code: "ok" };
  };

  const ioMemberCardAccess = async ({ projectID, memberCardID }) => {
    const project = ecs.root[projectID];
    if (!project) return { code: "fail", details: "Project not found." };
    
    const record = project.project0members[memberCardID];
    if (!record) return { code: "guest", details: "Not a member of this Project." };

    return { code: "ok", roles: record.roles, effects: record.effects };
  };

  const ioAddRole = async ({ projectID, memberCardID, role }) => {
    /* Access! */

    const project = ecs.root[projectID];
    if (!project) return { code: "fail", details: "Project not found." };

    const record = project.project0members.roster[memberCardID];

    if (record) {
      record.roles = [ ...new Set([ ...record.roles, role ]) ];
    } else {
      project.project0members.roster[memberCardID] = {
        memberCardID,
        memberName: ecs.root[memberCardID].memberCard0.name || "- Unknown -",
        roles: [ role ],
        effects: [ 'new' ]
      };      
    }

    await project.saveFile.save();

    const messageBaseID = ecs.findOne(v => v.type === 'MessageBase0' && v.located.rel === projectID).id;

    if (!messageBaseID) {
      log(`No MessageBase0 for project ${projectID}.`);        
    } else {
      core.mods.msg0.system({ 
        rel: projectID, msg: `Added role "${role}" for [MemberCard0 ${ project.project0members.roster[memberCardID].memberName }].`, messageBaseID 
      });
    }

    return { code: "ok" };
  };

  const ioRemoveRole = async ({ projectID, memberCardID, role }) => {
    /* Access! */

    const project = ecs.root[projectID];
    if (!project) return { code: "fail", details: "Project not found." };

    const record = project.project0members.roster[memberCardID];

    if (record) {
      const index = record.roles.indexOf(role);
      if (!~index) return { code: "ok", details: "The member ain't got this role yet." };

      record.roles.splice(index, 1);
      await project.saveFile.save();
    } else {
      return { code: "ok", details: "The member has no record in the project." };
    }

    const messageBaseID = ecs.findOne(v => v.type === 'MessageBase0' && v.located.rel === projectID).id;

    if (!messageBaseID) {
      log(`No MessageBase0 for project ${projectID}.`);        
    } else {
      core.mods.msg0.system({ 
        rel: projectID, msg: `Removed role "${role}" for [MemberCard0 ${ project.project0members.roster[memberCardID].memberName }].`, messageBaseID 
      });
    }

    return { code: "ok" };
  };

  return { 
    ioRegister, ioDeploy, ioGetDeployRoster, ioGetDeployment, ioSetDeploymentTarget, ioEnter, ioMemberCardAccess,
    ioAddRole, ioRemoveRole 
  };
};