module.exports = {
  apps: [{
    name: 'pg-progress-server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Environment variables will be loaded from .env.production
    // via dotenv in the application
  }],

  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/pg-progress.git',
      path: '/var/www/pg-progress',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && npm run migrate:prod && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};