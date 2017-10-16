import xs from 'xstream'
import { Sources, Sinks } from './interfaces'

export default function main(sources: Sources): Sinks {
  const response = sources.HTTP.select('foo').flatten()
  return {
    console: xs.merge(
      sources.console.map(x => `${x.replace('\n', '')} and out\n`),
      response.map(res => res.text)
    ),
    HTTP: xs.of({ url: 'https://google.fr', category: 'foo' })
  }
}
