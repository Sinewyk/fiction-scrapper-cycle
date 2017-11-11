import xs, { Stream } from 'xstream'
import { Driver } from '@cycle/run'

interface Options {
  listenToStdin?: boolean
}

export function makeConsoleDriver(
  options: Options = {},
): Driver<Stream<string>, Stream<string>> {
  return function consoleDriver(sink) {
    sink.subscribe({
      next: msg => process.stdout.write(msg),
      error: err => process.stderr.write(err),
      complete: () => {},
    })
    if (options.listenToStdin) {
      const stream = xs.create<string>({
        start: listener =>
          process.stdin.on('data', (data: string) => {
            const str = data.toString()
            if (str.slice(0, 4) === 'exit') {
              process.exit(0)
            }
            listener.next(str)
          }),
        stop: () => process.stdin.removeAllListeners(),
      })
      return stream
    }
    return xs.empty()
  }
}
