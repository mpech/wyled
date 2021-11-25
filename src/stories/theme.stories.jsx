import React from 'react'
import wyled, { ThemeProvider } from '../wyled.js'

const WyledThemeDiv = wyled.div`
  color: ${({ theme }) => theme.color};
  text-decoration: ${({ theme }) => theme.deco};
`

export const ThemeMain = () => {
  return (
    <ThemeProvider theme={{ color: 'blue' }}>
      <ThemeProvider theme={{ deco: 'underline' }}>
        <WyledThemeDiv>blue underline</WyledThemeDiv>
      </ThemeProvider>
      <WyledThemeDiv>blue NOT underline</WyledThemeDiv>
    </ThemeProvider>
  )
}
export default {
  title: 'theme'
}
