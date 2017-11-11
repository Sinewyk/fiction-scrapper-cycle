import xs, { Stream } from 'xstream'
import { HTTPSource } from '@cycle/http'
import isolate from '@cycle/isolate'
import { StateSource } from 'cycle-onionify'
import { ConsoleSourceOrSink, HTTPSink } from './interfaces'

export interface State {}

export type Reducer = (prev?: State) => State | undefined
export type AppSinks = Sinks & { onion: Stream<Reducer> }

export interface Sources {
  HTTP: HTTPSource
  url: Stream<string>
  onion: StateSource<State>
}

export interface Sinks {
  console: ConsoleSourceOrSink
  HTTP: HTTPSink
  onion: Stream<Reducer>
}

export function Single(sources: Sources): Sinks {
  return {
    console: sources.url
      .map(initialUrl =>
        xs.merge(
          xs.of(`${initialUrl}\n`),
          sources.HTTP
            .select()
            .flatten()
            .map(
              res =>
                `${initialUrl} fetched ! ${res.text.length}, from request ${res
                  .request.url}\n`,
            ),
        ),
      )
      .flatten(),
    HTTP: sources.url,
    onion: xs.never(),
  }
}

const IsolateSingle = (sources: Sources): Sinks => isolate(Single)(sources)

export default IsolateSingle
