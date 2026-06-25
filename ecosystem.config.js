module.exports = {
    apps: [{
      name: "my-app",
      script: "build/index.js",
      node_args: "--env-file=.env.production"
    }]
  };
  