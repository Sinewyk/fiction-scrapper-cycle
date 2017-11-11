import { Stream } from 'xstream'
import { HTTPSource, RequestOptions } from '@cycle/http'

export type ConsoleSourceOrSink = Stream<string>
export type HTTPSink = Stream<string | RequestOptions>

export interface Sources {
  initialData: Stream<string>
  HTTP: HTTPSource
  console: ConsoleSourceOrSink
}

export interface Sinks {
  HTTP: HTTPSink
  console: ConsoleSourceOrSink
}
