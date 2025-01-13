const port = "9091"
module.exports = {
  apps: [{
    name: 'riset-alpha',
    // script: 'NUXT_PB_URL="http://127.0.0.1:8090" NUXT_PUBLIC_PB_URL="https://bgs-studio-db.crunchymediadigital.id" PORT=8001 node .output/server/index.mjs',
    script: `PORT=${port} node .output/server/index.mjs`,
    watch: '.',
    // exec_mode: 'cluster'

  }],

};