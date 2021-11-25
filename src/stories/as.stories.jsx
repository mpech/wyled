import React from 'react'
import wyled from '../wyled.js'

const WyledDiv = wyled.div`
  color: green;
`
const WyledP = wyled.p``
export const As = () => {
  return (
    <>
      <WyledDiv as={WyledP}>should be p</WyledDiv>
      <WyledDiv as='p'>should be p</WyledDiv>
    </>
  )
}
export default {
  title: 'as'
}
