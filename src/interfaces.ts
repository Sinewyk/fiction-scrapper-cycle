import { Stream } from 'xstream'
import { HTTPSource, RequestOptions } from '@cycle/http'

export interface Sources {
  initialData: Stream<string>
  HTTP: HTTPSource
  console: Stream<string>
}

export interface Sinks {
  HTTP: Stream<string | RequestOptions>
  console: Stream<string>
}
