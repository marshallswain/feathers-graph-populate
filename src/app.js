
// Configure Feathers app.

const path = require('path')
const compress = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./logger')


const favicon = require('serve-favicon')


const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')


const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')

const generatorSpecs = require('../feathers-gen-specs.json')




const app = express(feathers())


// Load app configuration
app.configure(configuration())

app.set('generatorSpecs', generatorSpecs)


// Enable security, CORS, compression, favicon and body parsing
app.use(helmet(

))
app.use(cors(

))
app.use(compress(

))
app.use(express.json(

))
app.use(express.urlencoded(

  { extended: true }

))

// Use favicon
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))


// Host the public folder
app.use('/', express.static(app.get('public')))



// Set up Plugins and providers

app.configure(express.rest(

))

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
// Set up our services (see `services/index.js`)
app.configure(services)


// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))


app.hooks(appHooks)

const moduleExports = app

module.exports = moduleExports



