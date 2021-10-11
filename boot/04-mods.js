core.log("[Yehat Backend]Booting Mods.");

// [ 'express0', 'main0', 'base0', 'ecs', 'events0'/* 'express', 'hub', 'workshop', 'mail', 'marlin', 'epitaffyadmin', 'ecs', 'online', 'gallery' */ ].map(mod => {
//   core.mods[mod] = require(`./mods/${mod}.js`)();
// });

core.modsFailed = {};
const files = require('fs').readdirSync('./mods');
for(let file of files) {
  if (file.match(/\.js$/) === null) continue;

  let name = file.replace('.js', ''); /* bad */
  // let mod = ;
  try {
    core.mods[name] = require('../mods/' + file)();  
  } catch(e) {
    core.modsFailed[name] = e;
    core.log("[Yehat Backend]Failed to load Mod", name, e);
    process.exit();
  }

  // if (mod.runAsync) {
  //   await mod.runAsync();
  // }
}

const mods = Object.keys(core.mods).filter(v => v.name !== 'express');

core.log(`[Yehat Backend]Mods loaded (${mods.length}): ${mods.join(", ")}`);

