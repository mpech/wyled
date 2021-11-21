import cleanup from './_/cleanup.js'
import React from 'react'
import { render } from '@testing-library/react'
import wyledOpen, { ThemeProvider, css } from '../src/wyled.js'
import { test, suite } from 'uvu'
import { is as assertIs } from 'uvu/assert'
import assertMatches, { match, unique } from 'assertmatches'

const h = React.createElement

const terminal = suite('terminal')
terminal.after.each(cleanup)
terminal('scripts terminal', () => {
  const Span = wyledOpen.x`color: blue;`
  const { container } = render(h(Span, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" theme="[object Object]">test</x><style>.${B}{color:blue;}</style>`
})
terminal('scripts terminal with different class', () => {
  const Span = wyledOpen.x`color: blue;`
  const Span2 = wyledOpen.x`color: blue;`
  const { container } = render(h('div', null, [h(Span, { key: 0 }), h(Span2, { key: 1 })]))
  const A = unique(/.+?(?=_)/)
  const B = unique(/.+?(?=["{])/)
  const C = unique(/.+?(?=_)/)
  assertMatches(container.innerHTML)`<div><x class="${A}_noname ${B}" theme="[object Object]"></x><style>.${B}{color:blue;}</style><x class="${C}_noname ${B}" theme="[object Object]"></x><style>.${B}{color:blue;}</style></div>`
})
terminal.run()

const wyledComp = suite('component')
wyledComp.after.each(cleanup)
wyledComp('overrides terminal', () => {
  const Span = wyledOpen.x`color: blue;`
  const WyledSpan = wyledOpen(Span)`color: green;`
  const { container } = render(h(WyledSpan, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" theme="[object Object]">test</x><style>.${B}{color:blue;color:green;}</style>`
})
wyledComp('overrides wyled comp', () => {
  const West = wyledOpen.x`color: blue;`
  const WyledWest = wyledOpen(West)`color: green;`
  const WyledWyledWest = wyledOpen(WyledWest)`color: pink;`
  const { container } = render(h(WyledWyledWest, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" theme="[object Object]">test</x><style>.${B}{color:blue;color:green;color:pink;}</style>`
})
wyledComp('overrides react comp', () => {
  const WyledSpan = wyledOpen(({ className }) => h('x', { className }, 'test'))`color: green;`
  const { container } = render(h(WyledSpan, null, ''))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:green;}</style>`
})
wyledComp('can set displayName onto class', () => {
  const WyledSpan = wyledOpen(({ className }) => h('x', { className }, 'test'))`color: green;`
  WyledSpan.displayName = 'ok'
  const { container } = render(h(WyledSpan, null, ''))
  const A = match(/.+?(?=_)/)
  const any = match(/.*/)
  assertMatches(container.innerHTML)`<x class="${A}_ok${any}`
})
wyledComp.run()

const wyledTheme = suite('theme')
wyledTheme.after.each(cleanup)
wyledTheme('retrieves theme', () => {
  const Span = wyledOpen.x`color: ${({ theme }) => theme?.color};`
  const { container } = render(h(ThemeProvider, { theme: { color: 'blue', key: 0 } }, [h(Span, { key: 1 }, 'test')]))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" theme="[object Object]">test</x><style>.${B}{color:blue;}</style>`
})
wyledTheme.run()

const wyledAttrs = suite('attrs')
wyledAttrs.after.each(cleanup)
wyledAttrs('assign attrs', () => {
  const Span = wyledOpen.x.attrs(props => ({ ...props, color: 'blue' }))`color: ${({ color }) => color};`
  const { container } = render(h(Span))
  const A = match(/.+?(?=[_])/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" color="blue" theme="[object Object]"></x><style>.${B}{color:blue;}</style>`
})
wyledAttrs.run()

const wyledCss = suite('css')
wyledCss.after.each(cleanup)
wyledCss('reuses css', () => {
  const acss = css`color: ${({ mycolor }) => mycolor}`
  const Span = wyledOpen.x`color: green;${acss}`
  const Span2 = wyledOpen.y`color: red;${acss}`
  const { container } = render(h(Span, { mycolor: 'pink' }, [h(Span2, { mycolor: 'brown', key: 0 })]))
  const A = match(/.+?(?=[_])/)
  const C = match(/.+?(?=[_])/)
  const B = match(/.+?(?=["{])/)
  const D = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" mycolor="pink" theme="[object Object]"><y class="${C}_noname ${D}" mycolor="brown" theme="[object Object]"></y><style>.${D}{color:red;color:brown;}</style></x><style>.${B}{color:green;color:pink;}</style>`
})
wyledCss.run()
