import xs, { Stream } from 'xstream'
import { HTTPSource } from '@cycle/http'
import { StateSource } from 'cycle-onionify'
import { ConsoleSourceOrSink, HTTPSink } from './interfaces'
import { getBookConf } from './hosts'
import dropRepeats from 'xstream/extra/dropRepeats'

enum Status {
  Ok,
  Error,
  Finished,
}

interface Chapter {
  number: number
  status: Status
  content?: string
}

export interface State {
  id: string
  init: boolean
  infos?: any
  status: Status
  err?: Error
  chapters: Chapter[]
}

export type Reducer = (prev: State) => State
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

export function makeInitialState(id: string): State {
  return {
    id,
    init: true,
    status: Status.Ok,
    chapters: [],
  }
}

// When state changes, we know what to do
function intent(onion: StateSource<State>): Sinks {
  const stateId$ = onion.state$
    .map(state => state.id)
    .compose(dropRepeats())
    .remember()

  const bookConf$ = stateId$.map(url => getBookConf(url))

  const stateAndConf$ = xs.combine(
    onion.state$,
    bookConf$.replaceError(xs.empty),
  )

  const httpSink = stateAndConf$
    .map<HTTPSink>(([state, bookConf]) => {
      if (state.init === true && bookConf.shouldFetchInfos) {
        return xs.of({ url: state.id, category: INIT_REQUEST, lazy: true })
      }
      return xs.empty()
    })
    .flatten()

  const error$: Stream<Error> = bookConf$
    .replaceError(err => xs.of(err))
    .filter(err => err instanceof Error)

  return {
    console: xs
      .combine(stateId$, error$)
      .map(([id, err]) => `Error while fetching ${id}: ${err.message}\n`),
    onion: xs.merge(
      error$.map(err => (prevState: State) => ({
        ...prevState,
        init: false,
        status: Status.Error,
        err,
      })),
      stateAndConf$.map<Reducer>(([state, bookConf]) => {
        if (state.init === true && !bookConf.shouldFetchInfos) {
          return prevState => ({
            ...prevState,
            init: false,
          })
        }
        return x => x
      }),
    ),
    HTTP: httpSink,
  }
}

// When http request completes, we know how to change the model
function model(http$: HTTPSource): Sinks {
  const handleInit$ = http$
    .select()
    .flatten()
    .map(res => (prevState: State) => {
      switch (res.request.category) {
        case INIT_REQUEST:
          return {
            ...prevState,
            init: false,
            infos: 'stuff is fetched',
          }
        default:
          return prevState
      }
    })

  return {
    onion: handleInit$,
    HTTP: xs.empty(),
    console: xs.empty(),
  }
}

// And so my cycle is initialState => intent => model until fetch is over =)
// At the end, just concatenate & transforms and write to disk with a fs driver
export default function Single(sources: Sources): Sinks {
  const intentSinks = intent(sources.onion)
  const modelSinks = model(sources.HTTP)
  return {
    console: xs.merge(intentSinks.console, modelSinks.console),
    HTTP: intentSinks.HTTP,
    onion: xs.merge(intentSinks.onion, modelSinks.onion),
  }
}
