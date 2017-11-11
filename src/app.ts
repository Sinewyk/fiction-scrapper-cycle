import xs from 'xstream'
import { Sources, Sinks } from './interfaces'
import { extractSinks } from 'cyclejs-utils'
import Single, { Sinks as SingleSinks } from './Single'

export default function main(sources: Sources): Sinks {
  const stuff$ = sources.initialData
    .map(url => {
      console.log(`should only be called once per url ${url}`)
      return Single({
        url: xs.of(url),
        HTTP: sources.HTTP,
      })
    })
    .fold<SingleSinks[]>((acc, x) => acc.concat(x), [])
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
