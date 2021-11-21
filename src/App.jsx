import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import wyledOpen, { wyled, ThemeProvider, css, createGlobalStyle, keyframes } from './wyled'

const Comp = React.forwardRef(({ children, className }, ref) => {
  return <div className={className} ref={ref}>{children}</div>
})
const Rect = wyledOpen(Comp)`
  background: ${({ color }) => color};
  width: ${({ width }) => width}px;
`
const Title = wyled.span`
  text-decoration: underline;
  background: pink;
`
Title.displayName = 'title??'
const OverTitle = wyled(Title)`
  background: ${({ count }) => count % 2 ? 'red' : 'yellow'};
`
OverTitle.displayName = 'OverTitle'

const Button = wyled.button`color: blue;`

const Child = wyled.div`
  span {
    color: green;
  }
  & > b:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`
const OpenChild = wyledOpen(Child)``
const Parent = wyled.div`
  color: red;
  border: 1px solid black;

  ${OpenChild} {
    span {
      color: yellow;
    }
  }
`
OpenChild.displayName = 'OpenChild'
const Ref = wyledOpen.div``
const Box = wyled.div`
  color: ${({ theme: { color } }) => color};
`
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
const Global = createGlobalStyle`
  body {
    background: #eee;
  }
`
const x = keyframes``
const Y = wyled.div`
  ${x}
`

const Z = wyled.div.attrs(({ a }) => ({ b: a }))`
  color: ${({ b }) => b};
`
const Z2 = wyled(Z)`
  color: ${({ b }) => b};
`
function App () {
  const [count, setCount] = useState(0)
  const ref = useRef()
  const [content, setContent] = useState('')
  return (
    <div className='App'>
      <Rect color='green' ref={ref}>react</Rect>
      <Rect color='blue' width='200'>blue!</Rect>
      <Title>xxx</Title><br />
      <OverTitle count={count}>{count}</OverTitle>
      <button onClick={() => setCount(old => old + 1)}>put</button>

      <Parent className='toto'>
        <OpenChild>
          <span>test</span>
          <b>uuu</b>
        </OpenChild>
      </Parent>
      <Ref ref={ref}>content</Ref>
      <button onClick={() => (setContent(ref.current.innerHTML))}>show refcontent</button><div>{content}</div>
      <ThemeProvider theme={{ color: 'blue' }}>
        <Box>bbb</Box>
      </ThemeProvider>
      <StyledCss test='green'>hello</StyledCss>
      <StyledCss2 test='green'>hello</StyledCss2>
      <Global />
      <Z a='pink'>fff be pink</Z>
    </div>
  )
}
export default App
