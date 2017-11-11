import { Stream } from 'xstream'
import { HTTPSource, RequestOptions } from '@cycle/http'

export type ConsoleSourceOrSink = Stream<string>
export type HTTPSink = Stream<string | RequestOptions>
export type InitialDataStream = Stream<string>
export type HTTPSource = HTTPSource
