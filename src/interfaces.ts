import { Stream } from 'xstream';
import { HTTPSource, RequestOptions } from '@cycle/http';
import { StateSource } from '@cycle/state';
import { SingleState } from './Single';

export type HTTPSinkEvent = string | RequestOptions;
export type ConsoleSourceOrSink = Stream<string>;
export type HTTPSink = Stream<HTTPSinkEvent>;
export type InitialDataStream = Stream<string>;
export type HTTPSource = HTTPSource;

export type Reducer<T> = (prev?: T) => T;

export interface BookConfFactory {
  createBookConf(initialUrl: string): BookConf;
}

export interface BookConf {
  shouldFetchInfos: boolean;
  getChapterUrl(chapterNumber: number): string;
}

export interface RootState {
  books: SingleState[];
}

export interface Sources {
  state: StateSource<RootState>;
  initialData: Stream<string>;
  HTTP: HTTPSource;
}

export interface Sinks {
  state: Stream<Reducer<RootState>>;
  HTTP: HTTPSink;
  console: ConsoleSourceOrSink;
}
