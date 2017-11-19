import * as wuxia from '../www.wuxiaworld.com'

const harness = [
  {
    host: wuxia,
    name: 'getChapterUrl',
    initialUrl: 'https://www.wuxiaworld.com/foo/foo-chapter-1',
    expectedForChapter2: 'https://www.wuxiaworld.com/foo/foo-chapter-2',
  },
  {
    host: wuxia,
    name: 'getChapterUrl force https',
    initialUrl: 'http://www.wuxiaworld.com/foo/foo-chapter-1',
    expectedForChapter2: 'https://www.wuxiaworld.com/foo/foo-chapter-2',
  },
]

harness.forEach(testConf => {
  it(`${testConf.host.hostname} ${testConf.name}`, () => {
    const bookConf = wuxia.createBookConf(testConf.initialUrl)
    expect(bookConf.getChapterUrl(2)).toEqual(testConf.expectedForChapter2)
  })
})
