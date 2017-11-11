import xs from 'xstream'
import { run, Drivers } from '@cycle/run'
import app from './app'
import { makeConsoleDriver } from './drivers/console'
import { makeHTTPDriver } from '@cycle/http'
import { Sources, Sinks } from './interfaces'

const drivers: Drivers<Sources, Sinks> = {
  initialData: () =>
    // feed from commander or yargs or something
    xs.fromArray([
      // 'https://www.fanfiction.net/s/12288523/1/Plucking-the-Strings-Redux',
      // 'https://www.fanfiction.net/s/12576821/1/War-Crimes',
      'https://jsonplaceholder.typicode.com/users/1',
      'https://jsonplaceholder.typicode.com/users/2',
    ]),
  console: makeConsoleDriver(),
  HTTP: makeHTTPDriver(),
}

run(app, drivers)
