import React, { useState, useRef, useEffect } from 'react'

const arr = '0'.repeat(1000).split('')
export const HocTimer = (Components) => {
  let labelToTimes = {}
  let p
  return ({ onEnd, n: nTimes = 1 }) => {
    const [n, setN] = useState(0)
    const timer = useRef('start')
    const [C, label] = Components[n % Components.length]
    if (n === 0) {
      labelToTimes = {}
    }
    if (timer.current === 'start') {
      p = window.performance.now()
      timer.current = 'wait'
    }
    useEffect(() => {
      const elapsed = window.performance.now() - p
      labelToTimes[label] = (labelToTimes[label] || []).concat(elapsed)
      if (n + 1 < Components.length * (nTimes + 1)) {
        timer.current = 'start'
        setN(n => n + 1)
      } else {
        onEnd(labelToTimes)
      }
    }, [n, label, nTimes])
    return arr.map((x, i) => {
      return <C key={label + i}>a</C>
    })
  }
}
export const onEnd = dic => {
  const table = Object.entries(dic).reduce((acc, [label, values]) => {
    const vals = values.slice(1) // first bench has no penalty. Ignore it!
    acc[label] = {
      values: vals.map(x => x.toFixed(0)).join(' '),
      avg: vals.reduce((s, v) => s + v, 0) / vals.length
    }
    return acc
  }, {})
  console.table(table)
}
