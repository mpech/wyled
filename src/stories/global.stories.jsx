import React from 'react'
import { createGlobalStyle } from '../wyled.js'
const Global = createGlobalStyle`
  body {
    background: #eee;
  }
`
export const CreateGlobalStyle = () => {
  return (
    <>
      <Global />
      background should be grey
    </>
  )
}
export default {
  title: 'global'
}
