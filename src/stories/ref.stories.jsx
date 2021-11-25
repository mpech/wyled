import React, { useState } from 'react'
import wyled from '../wyled.js'
const Comp = React.forwardRef(({ children, className }, ref) => {
  return <div className={className} ref={ref}>{children}</div>
})
const Rect = wyled(Comp)`
  background: ${({ color }) => color};
  width: ${({ width }) => width}px;
`
export const Ref = () => {
  const [node, setNode] = useState()
  return (
    <>
      <Rect color='green' ref={setNode}>react</Rect>
      <Rect color='lightblue' width='200'>expect react: {node?.innerHTML}</Rect>
    </>
  )
}
export default {
  title: 'ref'
}
