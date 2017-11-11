import xs, { Stream } from 'xstream'
import { HTTPSource } from '@cycle/http'
import { ConsoleSourceOrSink, HTTPSink } from './interfaces'

export interface Sources {
  HTTP: HTTPSource
  url: Stream<string>
}

export interface Sinks {
  console: ConsoleSourceOrSink
  HTTP: HTTPSink
}

export default function Single(sources: Sources): Sinks {
  return {
    console: sources.url
      .map(initialUrl =>
        xs.merge(
          xs.of(`${initialUrl}\n`),
          sources.HTTP
            .select()
            .flatten()
            .map(
              res =>
                `${initialUrl} fetched ! ${res.text.length}, from request ${res
                  .request.url}\n`,
            ),
        ),
      )
      .flatten(),
    HTTP: sources.url,
  }
}
