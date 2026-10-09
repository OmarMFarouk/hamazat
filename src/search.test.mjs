import assert from 'node:assert/strict'
import { AUTHORS, BOOKS, hit, matches, othersBy } from './data.js'

const find = (q) => BOOKS.filter((b) => matches(b, q)).map((b) => b.title)

// spelling people actually type: no hamza, no tashkeel, ه for ة, words in any order
assert.ok(find('احمد خالد توفيق').length === 3)
assert.ok(find('توفيق احمد').length === 3)
assert.ok(find('غدنز').includes('علم الاجتماع'))
assert.ok(find('ابو زهره').length === 2)
assert.ok(find('let them').includes('نظرية التغافل'))
assert.deepEqual(find('كتاب غير موجود'), [])

assert.ok(hit('د. أحمد خالد توفيق', 'أحمد'))
assert.ok(!AUTHORS.some((a) => a.name === 'مجموعة مؤلفين'))
assert.equal(AUTHORS.find((a) => a.name === 'د. أحمد خالد توفيق').count, 3)
assert.equal(othersBy(BOOKS.find((b) => b.title === 'سافاري')).length, 2)
assert.equal(othersBy(BOOKS.find((b) => b.author === 'مجموعة مؤلفين')).length, 0)
console.log('search ok')
