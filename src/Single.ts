import xs from 'xstream'
import { Sources } from './interfaces'

export default function Single(sources: Sources, initialUrl: string) {
  return {
    console: xs.merge(
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
    HTTP: xs.of(initialUrl),
  }
}
