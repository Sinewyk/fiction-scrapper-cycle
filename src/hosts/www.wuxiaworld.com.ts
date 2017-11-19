import * as url from 'url'
import * as R from 'ramda'
import { BookConf } from '../interfaces'

export const hostname = 'wuxiaworld.com'

export function createBookConf(initialUrl: string): BookConf {
  const process = R.pipe<string, url.Url, url.Url, string, string[], string[]>(
    url.parse,
    // wuxiaworld supports https, it's broken for assets & shit
    // but we are directly scrapping html so ... force https
    R.assoc('protocol', 'https:'),
    url.format,
    str => str.split('-'),
    strArr => strArr.slice(0, -1),
  )

  const parts = process(initialUrl)

  return {
    getChapterUrl: R.pipe<number, string[], string>(
      R.pipe<number, string[], string[]>(x => [x.toString()], R.concat(parts)),
      R.join('-'),
    ),
  }
}
