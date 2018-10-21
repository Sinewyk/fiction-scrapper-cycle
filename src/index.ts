import xs from 'xstream';
import { run, Drivers } from '@cycle/run';
import app, { Sources, Sinks } from './app';
import { makeConsoleDriver } from './drivers/console';
import { makeHTTPDriver } from '@cycle/http';
import onionify from 'cycle-onionify';

const drivers: Drivers<Sources, Sinks> = {
  initialData: () =>
    // feed from commander or yargs or something
    xs.fromArray([
      // 'https://www.fanfiction.net/s/12288523/1/Plucking-the-Strings-Redux',
      // 'https://www.fanfiction.net/s/12576821/1/War-Crimes',
      'https://jsonplaceholder.typicode.com/users/1',
      'http://www.wuxiaworld.com/tde-index/tde-chapter-196/',
    ]),
  console: makeConsoleDriver(),
  HTTP: makeHTTPDriver(),
};

run(onionify(app), drivers);
