import xs, { Stream } from 'xstream'
import { HTTPSource } from '@cycle/http'
import { StateSource } from 'cycle-onionify'
import { ConsoleSourceOrSink, HTTPSink } from './interfaces'

export interface State {
  id: string
  init: boolean
  infos?: any
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

const INIT_REQUEST = 'init'

// When state changes, we know what to do, fetch infos, keep fetching or stop
function intent(onion: StateSource<State>): HTTPSink {
  return onion.state$
    .map(x => {
      if (x.init === true) {
        return xs.of({
          url: x.id,
          category: INIT_REQUEST,
          lazy: true,
        })
      }
      return xs.empty()
    })
    .flatten()
}

// When http request completes, we know how to change the model
function model(http$: HTTPSource): Stream<Reducer> {
  const handleInit$ = http$
    .select()
    .flatten()
    .map(res => (prevState: State) => {
      switch (res.request.category) {
        case INIT_REQUEST:
          return {
            ...prevState,
            init: false,
            infos: res.text,
          }
        default:
          return prevState
      }
    })

  return xs.merge(handleInit$)
}

// And so my cycle is initialState => intent => model until fetch is over =)
// At the end, just concatenate & transforms and write to disk with a fs driver
export default function Single(sources: Sources): Sinks {
  return {
    console: xs.empty(),
    HTTP: intent(sources.onion),
    onion: model(sources.HTTP),
  }
}
