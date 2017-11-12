import xs, { Stream } from 'xstream'
import { extractSinks } from 'cyclejs-utils'
import { StateSource } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { HTTPSource, HTTPSink, ConsoleSourceOrSink } from './interfaces'
import Single, { Sinks as SingleSinks, State as SingleState } from './Single'

export type State = { [url: string]: SingleState }

export interface Sources {
  initialData: Stream<string>
  HTTP: HTTPSource
}
export type Reducer = (prev?: State) => State | undefined
export interface Sinks {
  HTTP: HTTPSink
  console: ConsoleSourceOrSink
}

export default function main(
  sources: Sources & {
    onion: StateSource<State>
  },
): Sinks & { onion: Stream<Reducer> } {
  const stuff$ = sources.initialData
    .fold<{ [url: string]: SingleSinks }>((acc, initialUrl) => {
      if (acc[initialUrl]) {
        return acc
      }
      const isolateSingle = isolate(Single)
      acc[initialUrl] = isolateSingle({
        url: xs.of(initialUrl),
        HTTP: sources.HTTP,
        onion: sources.onion,
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

  return { console: sinks.console, HTTP: sinks.HTTP, onion: xs.never() }
}
