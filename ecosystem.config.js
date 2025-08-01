module.exports = {
  apps: [
    {
      name: 'tzikbal-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s',
    },
  ],
};
