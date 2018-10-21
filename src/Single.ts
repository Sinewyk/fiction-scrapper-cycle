import xs, { Stream } from 'xstream';
import { HTTPSource } from '@cycle/http';
import { StateSource } from '@cycle/state';
import { ConsoleSourceOrSink, HTTPSink } from './interfaces';
import { getBookConf } from './hosts';
import dropRepeats from 'xstream/extra/dropRepeats';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import { extractSinks } from 'cyclejs-utils';

enum Status {
  Init,
  Ok,
  Finished,
  Error,
}

interface Chapter {
  number: number;
  status: Status;
  content?: string;
}

export interface SingleState {
  id: string;
  infos?: any;
  status: Status;
  err?: Error;
  chapters: Chapter[];
}

export type Reducer = (prev: SingleState) => SingleState;
export type AppSinks = Sinks & { state: Stream<Reducer> };

export interface Sources {
  HTTP: HTTPSource;
  url: Stream<string>;
  state: StateSource<SingleState>;
}

export interface Sinks {
  console: ConsoleSourceOrSink;
  HTTP: HTTPSink;
  state: Stream<Reducer>;
}

const FETCH_INFOS = 'fetch_infos';
const FETCH_CHAPTER = 'fetch_chapter';

export function makeInitialState(id: string): SingleState {
  return {
    id,
    status: Status.Init,
    chapters: [],
  };
}

/**
function main(sources) {
  const state$ = sources.state.state$;
  const action$ = intent(sources.DOM);
  const reducer$ = model(action$);
  const vdom$ = view(state$);

  const sinks = {
    DOM: vdom$,
    state: reducer$,
  };
  return sinks;
}
*/

// When state changes, we know what to do
// Which should mean launching HTTP request & editing state to reflect in flight stuff ?
function intent(state: StateSource<SingleState>): Sinks {
  const stateId$ = state.stream
    .map(state => state.id)
    .compose(dropRepeats())
    .remember();

  const bookConf$ = stateId$.map(url => getBookConf(url));

  const stateAndConf$ = xs.combine(state.stream, bookConf$.replaceError(xs.empty));

  const httpSink = stateAndConf$
    .map<HTTPSink>(([state, bookConf]) => {
      if (state.status === Status.Init && bookConf.shouldFetchInfos) {
        return xs.of({ url: state.id, category: FETCH_INFOS, lazy: true });
      } else if (state.status !== Status.Error && state.chapters.length === 0) {
        return xs.from([1, 2, 3, 4, 5]).map(chapterNumber => ({
          url: bookConf.getChapterUrl(chapterNumber),
          category: FETCH_CHAPTER,
          chapterNumber,
        }));
      }
      return xs.empty();
    })
    .flatten();

  const error$: Stream<Error> = bookConf$
    .replaceError(err => xs.of(err))
    .filter(err => err instanceof Error);

  return {
    console: xs
      .combine(stateId$, error$)
      .map(([id, err]) => `Error while fetching ${id}: ${err.message}\n`),
    state: xs.merge(
      error$.map(err => (prevState: SingleState) => ({
        ...prevState,
        init: false,
        status: Status.Error,
        err,
      })),
    ),
    HTTP: httpSink,
  };
}

// When http request completes, we know how to change the state
function model(http$: HTTPSource): Sinks {
  const handleInit$ = http$
    .select()
    .compose(flattenConcurrently)
    .map(res => (prevState: SingleState) => {
      switch (res.request.category) {
        case FETCH_INFOS:
          return {
            ...prevState,
            init: false,
            infos: 'stuff is fetched',
          };
        case FETCH_CHAPTER:
          return {
            ...prevState,
            init: false,
            chapters: [
              ...prevState.chapters,
              {
                number: res.request.chapterNumber,
                content: res.request.chapterNumber,
                status: Status.Ok,
              },
            ],
          };
        default:
          return prevState;
      }
    });

  return {
    state: handleInit$,
    HTTP: xs.empty(),
    console: xs.empty(),
  };
}

// And so my cycle is initialState => intent => model until fetch is over =)
// At the end, just concatenate & transforms and write to disk with a fs driver
export default function Single(sources: Sources): Sinks {
  const intentSinks = intent(sources.state);
  const modelSinks = model(sources.HTTP);
  return {
    console: xs.merge(intentSinks.console, modelSinks.console),
    HTTP: intentSinks.HTTP,
    state: xs.merge(intentSinks.state, modelSinks.state),
  };
}
