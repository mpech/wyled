import React, { useState } from 'react'
import wyled from '../wyled.js'

const Child = wyled.div`
  span {
    color: green;
  }
  & > b:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`
const OpenChild = wyled(Child)``
const Parent = wyled.div`
  color: red;
  border: 1px solid black;

  ${OpenChild} {
    span {
      color: pink;
    }
  }
`
export const ComponentAsString = () => {
  return (
    <>
      <Parent>
        <OpenChild>
          <span>should be pink because parent</span>
        </OpenChild>
      </Parent>
      <OpenChild>
        <span>should be green</span>
      </OpenChild>
    </>
  )
}

const WithDisplayName = wyled.div`color: green;`
WithDisplayName.displayName = 'nice'
export const WithDisplayNameStory = () => {
  const [node, setNode] = useState()
  const classes = [...node ? node.classList.values() : []]
  return <WithDisplayName ref={setNode}>my classes are: {classes.join(' ')}</WithDisplayName>
}
export default {
  title: 'component'
}
