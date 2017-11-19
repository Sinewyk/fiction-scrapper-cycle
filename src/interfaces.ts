import { Stream } from 'xstream'
import { HTTPSource, RequestOptions } from '@cycle/http'

export type HTTPSinkEvent = string | RequestOptions
export type ConsoleSourceOrSink = Stream<string>
export type HTTPSink = Stream<HTTPSinkEvent>
export type InitialDataStream = Stream<string>
export type HTTPSource = HTTPSource

export interface BookConfFactory {
  createBookConf(initialUrl: string): BookConf
}

export interface BookConf {
  shouldFetchInfos: boolean
  getChapterUrl(chapterNumber: number): string
}
