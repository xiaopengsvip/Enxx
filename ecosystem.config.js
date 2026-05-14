module.exports = {
  apps: [
    {
      name: "enxx-english-self-learning",
      script: "npm",
      args: "start",
      cwd: "/www/wwwroot/enxx.allapple.top",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "512M",
      watch: false,
      instances: 1,
      autorestart: true,
    },
  ],
};
