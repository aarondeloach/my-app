module.exports = {
    apps: [
        {
            name: "my-app",
            script: "build/index.js",
            env_file: '.env.production',
            node_args: "--env-file=.env.production",
        },
    ],
};
