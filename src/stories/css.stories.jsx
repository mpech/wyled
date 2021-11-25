import React from 'react'
import wyled, { css } from '../wyled.js'

const phoque = css`
  color: ${({ test }) => test};
`
const StyledCss = wyled.div`
  ${phoque}
`
const StyledCss2 = wyled.div`
  ${phoque}
  text-decoration: underline;
`

const A = wyled.span`
  color: ${({ color }) => color + 'n'};
`
export const FuncInProps = () => {
  return <A color='gree'>should be green</A>
}
export const InheritCss = () => {
  return (
    <>
      <StyledCss test='green'>should be green</StyledCss>
      <StyledCss2 test='green'>should be green underline</StyledCss2>
    </>
  )
}
const BooleanFalse = wyled.span`
  ${({ a }) => a && false}/* notice: no semi colon*/
  color: green;
`
export const ConditionnalInProps = () => {
  return <BooleanFalse>should be green</BooleanFalse>
}
export default {
  title: 'css'
}
