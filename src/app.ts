import xs, { Stream } from 'xstream'
import { StateSource, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'
import { HTTPSource, HTTPSink, ConsoleSourceOrSink } from './interfaces'
import Single, { State as SingleState, makeInitialState } from './Single'
import debounce from 'xstream/extra/debounce'
import * as debug from 'debug'

const d = debug('app')

export type State = {
  books: SingleState[]
}

export interface Sources {
  initialData: Stream<string>
  HTTP: HTTPSource
}
export type Reducer = (prev?: State) => State | undefined
export interface Sinks {
  HTTP: HTTPSink
  console: ConsoleSourceOrSink
}

const Books = makeCollection({
  item: Single,
  itemKey: (state: SingleState) => state.id,
  itemScope: key => key,
  collectSinks: instances => {
    return {
      onion: instances.pickMerge('onion'),
      console: instances.pickMerge('console'),
      HTTP: instances.pickMerge('HTTP'),
    }
  },
})

export default function main(
  sources: Sources & {
    onion: StateSource<State>
  },
): Sinks & { onion: Stream<Reducer> } {
  const initReducer$ = sources.initialData
    .fold<SingleState[]>(
      (acc, initialUrl) => [...acc, makeInitialState(initialUrl)],
      [],
    )
    .last()
    .map(initState => () => ({ books: initState }))

  const booksSinks = isolate(Books, 'books')(sources)

  const reducer$ = xs.merge<Reducer>(initReducer$, booksSinks.onion)

  const debug$ = d.enabled
    ? sources.onion.state$
        .map(state => `Current state :\n${JSON.stringify(state, null, '  ')}\n`)
        .compose(debounce(50))
    : xs.empty()

  return {
    console: xs.merge<string>(booksSinks.console, debug$),
    HTTP: booksSinks.HTTP,
    onion: reducer$,
  }
}
