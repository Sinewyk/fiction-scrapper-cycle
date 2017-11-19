// @TODO (sinewyk): track https://github.com/leebyron/ecmascript-export-ns-from

import * as assert from 'assert'
import { BookConfFactory, BookConf } from '../interfaces'
import * as wuxiaworld from './www.wuxiaworld.com'
import * as url from 'url'

const DOMAINS = <{
  [key: string]: BookConfFactory | undefined
}>{
  'www.wuxiaworld.com': wuxiaworld,
}

export const getBookConf = (initialUrl: string): BookConf => {
  const parsedUrl = url.parse(initialUrl)

  assert(parsedUrl.host, 'It is an url')

  const bookConfFactory = DOMAINS[parsedUrl.host as string]

  assert(bookConfFactory, 'Host is supported')

  return (bookConfFactory as BookConfFactory).createBookConf(initialUrl)
}
