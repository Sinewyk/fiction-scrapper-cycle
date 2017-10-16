import xs from 'xstream'
import { run, Drivers } from '@cycle/run'
import app from './app'
import { makeConsoleDriver } from './drivers/console'
import { makeHTTPDriver } from '@cycle/http'
import { Sources, Sinks } from './interfaces'

const drivers: Drivers<Sources, Sinks> = {
  initialData: () => xs.from(['initial data']),
  console: makeConsoleDriver(),
  HTTP: makeHTTPDriver()
}

run(app, drivers)
