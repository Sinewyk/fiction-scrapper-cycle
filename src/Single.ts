import xs, { Stream } from 'xstream'
import { HTTPSource } from '@cycle/http'
import { StateSource } from 'cycle-onionify'
import { ConsoleSourceOrSink, HTTPSink } from './interfaces'

export interface State {
  id: string
  init: boolean
}

export type Reducer = (prev?: State) => State
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

export default function Single(sources: Sources): Sinks {
  const response$ = sources.HTTP.select().flatten()
  const reducer$ = xs.empty()
  return {
    console: sources.onion.state$
      .map(({ id: initialUrl }) =>
        response$.map(
          res =>
            `${initialUrl} fetched ! ${res.text.length}, from request ${res
              .request.url}\n`,
        ),
      )
      .flatten(),
    HTTP: sources.onion.state$.map(state => state.id),
    onion: reducer$,
  }
}
