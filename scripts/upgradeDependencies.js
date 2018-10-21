#!/usr/bin/env node

/* eslint no-process-exit: "off" */
/* eslint no-sync: "off" */
/* eslint strict: "off" */

const childProcess = require('child_process');
const R = require('ramda');
const argv = require('yargs').argv;
const pkg = require('../package.json');

const name = R.head;
const current = R.nth(1);
const wanted = R.nth(2);
const latest = R.nth(3);
const type = R.nth(4);
const onlyProd = argv.prod;
const onlyDev = argv.dev;

if (onlyDev && onlyProd) {
  throw new Error('Do not use both dev and prod flags, just leave them both out');
}

let output;
try {
  childProcess.execSync('yarn outdated --json', { stdio: 'pipe' }).toString();
  process.exit(0);
} catch (e) {
  output = R.pipe(
    R.toString,
    R.split('\n'),
    R.reject(R.isEmpty),
    R.map(JSON.parse),
    R.filter(R.propEq('type', 'table')),
    R.head,
  )(e.stdout);
}

const deps = R.pipe(
  R.filter(dep => R.not(R.any(R.equals(dep[0]), pkg.ignoredDependenciesUpdate || []))),
)(output.data.body);

R.pipe(
  onlyDev || onlyProd
    ? R.filter(dep => type(dep) === (onlyDev ? 'devDependencies' : 'dependencies'))
    : R.identity,
  R.filter(dep => wanted(dep) !== 'exotic'),
  R.filter(dep => wanted(dep) !== (argv.latest ? latest(dep) : current(dep))),
  R.map(dep => `${name(dep)}@^${argv.latest ? latest(dep) : wanted(dep)}`),
  x => (x.length > 0 ? `yarn upgrade ${x.join(' ')}` : ''),
  // console.log has a carriage return at the end
  // use process.stdout.write for raw printing with nothing extraneous
  x => (x !== '' ? process.stdout.write(x) : R.identity),
)(deps);
