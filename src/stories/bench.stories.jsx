import React, { useState } from 'react'
import wyled from '../wyled.js'
import styled from 'styled-components'
import { HocTimer, onEnd } from './bencher.jsx'
const WyledTitle = wyled.span`
  text-decoration: underline;
`
const WyledTitle2 = wyled.span`
  text-decoration: underline;
`
const StyledTitle = styled.span`
  text-decoration: underline;
`
const WyledDiv = wyled.div`
  .raw { text-decoration: underline; }
`
const Raw = () => <span className='raw'>a</span>
const Bench = HocTimer([
  [WyledTitle, 'wyled'],
  [WyledTitle2, 'wyled2'],
  [StyledTitle, 'styled'],
  [Raw, 'raw2']
])
export const SimpleBench = () => {
  const [key, setKey] = useState(0)
  return (
    <>
      <button onClick={() => setKey(key => key + 1)}>rerun</button>
      <WyledDiv key={key}>
        <Bench onEnd={onEnd} n={10} />
      </WyledDiv>
    </>
  )
}
export default {
  title: 'Bench'
}
