module.exports = {
  apps: [
    {
      name: 'clothme_analytics',
      script: 'dist/main.js',
      instances: 1, // Start with 1 instance to troubleshoot
      exec_mode: 'fork', // Use fork mode instead of cluster for TensorFlow
      autorestart: true,
      watch: false,
      max_memory_restart: '2G', // Increase memory limit
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      env_staging: {
        NODE_ENV: 'staging',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    }
  ]
};