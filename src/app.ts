import xs from 'xstream'
import { Sources, Sinks } from './interfaces'
import { extractSinks } from 'cyclejs-utils'
import Single, { Sinks as SingleSinks } from './Single'

export default function main(sources: Sources): Sinks {
  const stuff$ = sources.initialData
    .fold<{
      [url: string]: SingleSinks
    }>((acc, initialUrl) => {
      if (acc[initialUrl]) {
        return acc
      }
      acc[initialUrl] = Single({
        url: xs.of(initialUrl),
        HTTP: sources.HTTP,
      })
      return acc
    }, {})
    .last()
    .map(sinksPerInitialUrl => {
      const values: SingleSinks[] = (Object as any).values(sinksPerInitialUrl)
      return {
        console: xs.merge(...values.map(s => s.console)),
        HTTP: xs.merge(...values.map(s => s.HTTP)),
      }
    })

  const sinks = extractSinks(stuff$, ['console', 'HTTP'])

  return {
    console: sinks.console,
    HTTP: sinks.HTTP,
  }
}
