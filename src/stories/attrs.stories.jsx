import React from 'react'
import wyled from '../wyled.js'
const Alias = wyled.div.attrs({ as: 'span' })``

export const MapTagname = () => {
  return <Alias>should be span</Alias>
}

const Z = wyled.div.attrs(({ a }) => ({ b: a }))`
  color: ${({ b }) => b};
`
const Z2 = wyled(Z)`
  border: 1px solid ${({ b }) => b};
`
export const MapAttr = () => {
  return (
    <>
      <Z a='pink'>fff be pink</Z>
      <Z2 b='pink' a='green'>fff be pink. attrs mapped for current too</Z2>
    </>
  )
}
export default {
  title: 'attrs'
}
