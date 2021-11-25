import cleanup from './_/cleanup.js'
import React from 'react'
import { render } from '@testing-library/react'
import wyledOpen, { ThemeProvider, css } from '../src/wyled.js'
import { suite } from 'uvu'
import assertMatches, { match, unique } from 'assertmatches'

const h = React.createElement

const terminal = suite('terminal')
terminal.after.each(cleanup)
terminal('scripts terminal', () => {
  const Span = wyledOpen.x`color: blue;`
  const { container } = render(h(Span, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:blue;}</style>`
})
terminal('scripts terminal with different class', () => {
  const Span = wyledOpen.x`color: blue;`
  const Span2 = wyledOpen.x`color: blue;`
  const { container } = render(h('div', null, [h(Span, { key: 0 }), h(Span2, { key: 1 })]))
  const A = unique(/.+?(?=_)/)
  const B = unique(/.+?(?=["{])/)
  const C = unique(/.+?(?=_)/)
  assertMatches(container.innerHTML)`<div><x class="${A}_noname ${B}"></x><style>.${B}{color:blue;}</style><x class="${C}_noname ${B}"></x><style>.${B}{color:blue;}</style></div>`
})

const wyledComp = suite('component')
wyledComp.after.each(cleanup)
wyledComp('overrides terminal', () => {
  const Span = wyledOpen.x`color: blue;`
  const WyledSpan = wyledOpen(Span)`color: green;`
  const { container } = render(h(WyledSpan, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:blue;color:green;}</style>`
})
wyledComp('overrides wyled comp', () => {
  const West = wyledOpen.x`color: blue;`
  const WyledWest = wyledOpen(West)`color: green;`
  const WyledWyledWest = wyledOpen(WyledWest)`color: pink;`
  const { container } = render(h(WyledWyledWest, null, 'test'))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:blue;color:green;color:pink;}</style>`
})
wyledComp('overrides react comp', () => {
  const WyledSpan = wyledOpen(({ className }) => h('x', { className }, 'test'))`color: green;`
  const { container } = render(h(WyledSpan, null, ''))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:green;}</style>`
})
wyledComp('displayName is used on class attribute in tag', () => {
  const WyledSpan = wyledOpen(({ className }) => h('x', { className }, 'test'))`color: green;`
  WyledSpan.displayName = 'ok'
  const { container } = render(h(WyledSpan, null, ''))
  const A = match(/.+?(?=_)/)
  const any = match(/.*/)
  assertMatches(container.innerHTML)`<x class="${A}_ok${any}`
})
wyledComp('interpolates component as className in css', () => {
  const Comp = wyledOpen.y`color: green;`
  const Span = wyledOpen.x`${Comp} {color: blue;}`
  const { container } = render(h(Span, null, [h(Comp, { key: 0 })]))
  const A = match(/[a-z0-9]+/)
  const Ai = match(/[a-z0-9]+/)
  const B = unique(/[a-z0-9]+/)
  const Bi = unique(/[a-z0-9]+/)
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <x class="${Ai}_noname ${A}">
      <y class="${Bi}_noname ${B}"></y>
      <style>.${B}{color:green;}</style>
    </x>
    <style>.${A} .${Bi}_noname{color:blue;}</style>`
})
wyledComp('interpolates component with displayName as className in css', () => {
  const Comp = wyledOpen.y`color: green;`
  Comp.displayName = 'ok'
  const Span = wyledOpen.x`${Comp} {color: blue;}`
  const { container } = render(h(Span, null, [h(Comp, { key: 0 })]))
  const A = match(/[a-z0-9]+/)
  const Ai = match(/[a-z0-9]+/)
  const B = unique(/[a-z0-9]+/)
  const Bi = unique(/[a-z0-9]+_ok/)
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <x class="${Ai}_noname ${A}">
      <y class="${Bi} ${B}"></y>
      <style>.${B}{color:green;}</style>
    </x>
    <style>.${A} .${Bi}{color:blue;}</style>`
})
wyledComp('ignores falsy boolean condition', () => {
  const Span = wyledOpen.x`${() => false && 'color: blue;'}color: green;`
  const { container } = render(h(Span))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}"></x><style>.${B}{color:green;}</style>`
})
const wyledTheme = suite('theme')
wyledTheme.after.each(cleanup)
wyledTheme('retrieves theme', () => {
  const Span = wyledOpen.x`color: ${({ theme }) => theme?.color};`
  const { container } = render(h(ThemeProvider, { theme: { color: 'blue', key: 0 } }, [
    h(Span, { key: 1 }, 'test')
  ]))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}">test</x><style>.${B}{color:blue;}</style>`
})
wyledTheme('overrides theme', () => {
  const Outer = wyledOpen.x``
  const Inner1 = wyledOpen.y`font-size: ${({ theme }) => theme?.fontSize};color: ${({ theme }) => theme?.color}`
  const Inner2 = wyledOpen.z`font-size: ${({ theme }) => theme?.fontSize};color: ${({ theme }) => theme?.color}`
  const { container } = render(h(ThemeProvider, { theme: { fontSize: 3 } }, [
    h(Outer, { key: 0 }, [
      h(ThemeProvider, { key: 0, theme: { color: 'blue' } }, [
        h(Inner1, { key: 0 })
      ]),
      h(Inner2, { key: 1 })
    ])
  ]))
  const Xi = match(/.+?(?=_)/)
  const Yi = match(/.+?(?=_)/)
  const Zi = match(/.+?(?=_)/)
  const X = match(/.+?(?=["{])/)
  const Y = match(/.+?(?=["{])/)
  const Z = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${Xi}_noname ${X}"><y class="${Yi}_noname ${Y}"></y><style>.${Y}{font-size:3;color:blue;}</style><z class="${Zi}_noname ${Z}"></z><style>.${Z}{font-size:3;}</style></x>`
})
wyledTheme('overrides by function', () => {
  const Outer = wyledOpen.x`${({ theme }) => `text-align: ${theme['text-align']}; font-size: ${theme.fontSize};`}`
  const { container } = render(h(ThemeProvider, { theme: { fontSize: 3 } }, [
    h(ThemeProvider, { key: 0, theme: oldTheme => ({ 'text-align': 'center' }) }, [
      h(Outer, { key: 0 })
    ])
  ]))
  const A = match(/.+?(?=_)/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}"></x><style>.${B}{text-align:center;font-size:3;}</style>`
})

const wyledAttrs = suite('attrs')
wyledAttrs.after.each(cleanup)
wyledAttrs('assign attrs', () => {
  const Span = wyledOpen.x.attrs(props => ({ ...props, color: 'blue' }))`color: ${({ color }) => color};`
  const { container } = render(h(Span))
  const A = match(/.+?(?=[_])/)
  const B = match(/.+?(?=["{])/)
  assertMatches(container.innerHTML)`<x class="${A}_noname ${B}" color="blue"></x><style>.${B}{color:blue;}</style>`
})
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
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <x class="${A}_noname ${B}" mycolor="pink">
      <y class="${C}_noname ${D}" mycolor="brown">
      </y>
      <style>.${D}{color:red;color:brown;}</style>
    </x>
    <style>.${B}{color:green;color:pink;}</style>`
})
wyledCss('can get interpolated comp in css', () => {
  const Inner = wyledOpen.y``
  const acss = css`${Inner} { color: blue;}`
  const Span = wyledOpen.x`${acss}`
  const { container } = render(h(Span, {}, [h(Inner, { key: 0 })]))
  const Ai = match(/\w+/)
  const Bi = match(/\w+/)
  const A = match(/\w+/)
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <x class="${Ai} ${A}">
      <y class="${Bi} c0"></y>
    </x>
    <style>.${A} ${Inner.toString()}{color:blue;}</style>`
})

const wyledAs = suite('as')
wyledAs.after.each(cleanup)
wyledAs('map as with str comp', () => {
  const A = match(/.+?(?=[_])/)
  const B = match(/.+?(?=["{])/)
  const Span = wyledOpen.x``
  const { container } = render(h(Span, { as: 'div' }))
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <div class="${A}_noname ${B}"></div>
    `
})
wyledAs('map as with custom component', () => {
  const A = match(/.+?(?=[_])/)
  const B = match(/[^ {]+/)
  const C = match(/.+?(?=[_])/)
  const D = match(/.+?(?=["{])/)
  const Span = wyledOpen.x``
  const Div = wyledOpen.div`color: green;`
  const { container } = render(h(Span, { as: Div }))
  assertMatches(container.innerHTML).ignore(/\s*\n\s*/g)`
    <div class="${A}_noname ${B} ${C}_noname ${D}"></div>
    <style>.${B}{color:green;}</style>`
})
terminal.run()
wyledComp.run()
wyledTheme.run()
wyledAttrs.run()
wyledCss.run()
wyledAs.run()
