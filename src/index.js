
/* eslint-disable no-console */
// Start the server.

const logger = require('./logger')
const app = require('./app')
const seedData = require('./seed-data')



const port = app.get('port')
const server = app.listen(port)


process.on('unhandledRejection', (reason, p) => {

  logger.error('Unhandled Rejection at: Promise ', p, reason)


})

server.on('listening', async () => {

  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)


  await seedData(app)

})



