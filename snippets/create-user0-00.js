ecs.create("User0", {
  user0: {
    name: "koto"
  },
  user0secrets: {
    password: "xxxxxxxx"
  }
}).then(v => v.saveFile.save());