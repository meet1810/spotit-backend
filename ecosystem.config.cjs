module.exports = {
    apps: [
        {
            name: "node-api",
            script: "./src/server.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
            },
            error_file: "./logs/node-api-error.log",
            out_file: "./logs/node-api-out.log",
        },
    ],
};
