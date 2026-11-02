module.exports = {
  apps: [
    {
      name: 'theme-server',
      script: 'server/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        THEME_DATA_DIR: '/var/lib/ui-theme'
      }
    }
  ]
};

