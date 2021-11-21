import React, { useRef, useEffect, useLayoutEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import { compile, serialize, stringify } from 'stylis'
import murmur from 'murmurhash'
import X from 'styled-components'
const styled = X.default
class MyWc extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }
}
customElements.get('my-wc') || customElements.define('my-wc', MyWc)
const concatStyles = ({ props, strs = [[], []] }) => {
  let s = ''
  strs.forEach(([all, ...caps]) => {
    for (let i = 0; i < all.length - 1; ++i) {
      s += all[i]
      const matched = caps[i]
      if (typeof (matched) === 'function') {
        if (matched.__wyledctx) {
          if (!matched.__wyledctx.wcOpen) {
            console.log(`css selector will fail: ${matched.__wyledklass} is in shadowroot`)
          }
          s += '.' + matched.__wyledklass
        } else {
          s += matched({ theme: {}, ...props })
        }
      } else {
        s += caps[i]
      }
    }
    s += all[all.length - 1]
  })
  return s
}
const getCss = (klass, s) => serialize(compile(`.${klass}{${s}}`), stringify)
const WYLED_DEBUG = true
const getClass = (klass, displayName) => {
  if (!WYLED_DEBUG) return klass
  const name = displayName || 'noname'
  return 'c' + klass + '_' + name
}
const hash = s => murmur(s).toString(16)
const ThemeContext = React.createContext({})
const ReactWc = function ({ className = [], ...iProps }, outerRef) {
  const ctx = this
  const { ReactFunc, __wyledmapProps, __wyledstrs, __wyledklass, wcOpen } = ctx
  const ref = useRef()
  const theme = useContext(ThemeContext)
  const aProps = __wyledmapProps ? ({ ...iProps, ...__wyledmapProps(iProps) }) : iProps
  const props = Object.assign({ theme }, aProps)
  const styleStr = concatStyles({ props, strs: __wyledstrs })
  const cssKlass = 'c' + hash(styleStr)
  const instyle = getCss(cssKlass, styleStr)
  const classNames = [__wyledklass, cssKlass].concat(className)
  const children = [
    React.createElement(ReactFunc, { ...props, ref: outerRef, key: 0, className: classNames.join(' ') }),
    React.createElement('style', { key: 1 }, instyle)
  ]

  if (!wcOpen) {
    const c = React.createElement(React.Fragment, null, children)
    useLayoutEffect(() => { ReactDOM.render(c, ref.current.shadowRoot) })
    return React.createElement('my-wc', { ref }, null)
  }
  return React.createElement(React.Fragment, null, children)
}
const wyledFromTag = (tagName, wcOpen = false) => {
  const C = React.forwardRef((props, ref) => React.createElement(tagName, { ...props, ref }))
  return wyledFromFunc(C, wcOpen)
}
const wyledFromFunc = (C, wcOpen = false) => {
  const ctx = C.__wyledctx
    ? Object.assign({ wcOpen }, C.__wyledctx, {
        __wyledstrs: C.__wyledctx.__wyledstrs.slice(0)
      })
    : {
        wcOpen,
        ReactFunc: C,
        __wyledstrs: []
      }
  const D = function (...strs) {
    // upon invokation, maybe my props were mapped before
    ctx.__wyledmapProps = D.__wyledmapProps
    ctx.__wyledstrs.push(strs)
    const f = React.forwardRef(function () {
      ctx.__wyleddisplayName = f.displayName
      ctx.__wyledklass = getClass(f.styledComponentId, f.displayName)
      return ReactWc.apply(ctx, arguments)
    })
    f.__wyledctx = ctx
    f.styledComponentId = 'c' + murmur('' + Date.now() + Math.random())
    f.componentStyle = new Proxy({}, {
      get (targ, key) {
        if (key === 'rules') {
          console.log('warn: wyled injected into styled. will be ignored')
          console.log(Error.captureStackTrace({}))
          return []
        }
      }
    })

    f.foldedComponentIds = []
    f.target = styled.div``
    return f
  }
  D.attrs = mapProps => {
    D.__wyledmapProps = mapProps
    return D
  }

  return D
}
export const wyled = new Proxy(function () {}, {
  get: (target, prop, receiver) => wyledFromTag(prop),
  apply: (target, thisArg, [C]) => wyledFromFunc(C)
})

const wyledOpen = new Proxy(function () {}, {
  get: (target, prop, receiver) => wyledFromTag(prop, 'open'),
  apply: (target, thisArg, [C]) => wyledFromFunc(C, 'open')
})
export const ThemeProvider = ({ theme, children }) => {
  return React.createElement(ThemeContext.Provider, { value: theme }, children)
}
export const css = (...strs) => props => concatStyles({ props, strs: [strs] })
export const createGlobalStyle = (...strs) => () => {
  const instyle = concatStyles({ props: {}, strs: [strs] })
  return React.createElement('style', null, instyle)
}
export const keyframes = function (...strs) {
  console.log('keyFrames are not handled. Too complex')
  return () => {}
}
export default wyledOpen
