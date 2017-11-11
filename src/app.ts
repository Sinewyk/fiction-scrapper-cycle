import xs from 'xstream'
import { Sources, Sinks } from './interfaces'
import { extractSinks } from 'cyclejs-utils'
import isolate from '@cycle/isolate'
import Single from './Single'

export default function main(sources: Sources): Sinks {
  const stuff$ = sources.initialData
    .map(url => {
      console.log(`Should be called once ${url}`)
      const isolateSingle = isolate(Single, url)
      return isolateSingle(sources, url)
    })
    .fold<Sinks[]>((acc, x) => acc.concat(x), [])
    .last()
    .map(sinks => ({
      console: xs.merge(...sinks.map(s => s.console)),
      HTTP: xs.merge(...sinks.map(s => s.HTTP)),
    }))

  const sinks = extractSinks(stuff$, ['console', 'HTTP'])

  return {
    console: sinks.console,
    HTTP: sinks.HTTP,
  }
}
