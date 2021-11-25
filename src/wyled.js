import React, { useContext } from 'react'
import { compile, serialize, stringify } from 'stylis'
import murmur from 'murmurhash'
import X from 'styled-components'
const styled = X.default || X
let WYLED_DEBUG = true
let WYLED_INLINE = true
export const configure = (obj) => Object.entries(obj).forEach(([k, v]) => {
  switch (k) {
    case 'debug': WYLED_DEBUG = v; break
    case 'cssInline': WYLED_INLINE = v; break
    default: throw new Error('unknown conf option ' + k)
  }
})
const concatStyles = ({ props, strs = [[], []] }) => {
  let s = ''
  strs.forEach(([all, ...caps]) => {
    for (let i = 0; i < all.length - 1; ++i) {
      s += all[i]
      const matched = caps[i]
      if (typeof (matched) === 'function') {
        const r = matched({ theme: {}, ...props })
        s += (r !== null && r !== undefined && r !== true && r !== false) ? r : ''
      } else if (matched && matched.__wyledctx) {
        s += '.' + matched.__wyledctx.__wyledklass
      } else {
        s += caps[i]
      }
    }
    s += all[all.length - 1]
  })
  return s
}
const getCss = (klass, s) => serialize(compile(`.${klass}{${s}}`), stringify)
const getClass = (klass, displayName) => {
  if (!WYLED_DEBUG) return klass
  const name = displayName || 'noname'
  return 'c' + klass + '_' + name
}
class Updater {
  constructor () {
    this.lastTouched = 0
    this.lastUpdate = 0
    this.updates = new Map()
    this.style = document.createElement('style')
    this.style.dataset.debug = 'styled-components'
    setInterval(() => this.refresh(), 20)
  }

  refresh () {
    if (this.lastUpdate === this.lastTouched) { return }
    if (!this.style.parentNode) {
      document.querySelector('head').appendChild(this.style)
    }
    const css = [...this.updates.values()].join('\n')
    this.style.innerHTML = css
    this.lastUpdate = this.lastTouched
  }

  update (k, v) {
    this.updates.set(k, v)
    this.lastTouched++
  }
}
let updater
const hash = s => murmur(s).toString(16)
const ThemeContext = React.createContext({})
const render = (tagname, props, cssId, styleStr) => {
  const el = React.createElement(tagname, props)
  if (WYLED_INLINE) {
    return React.createElement(React.Fragment, null, el, styleStr.length ? React.createElement('style', null, styleStr) : null)
  }

  updater = updater || new Updater()
  updater.update(cssId, styleStr)
  return el
}
const ReactStatic = function ({ className = '', as, ...iProps }, ref) {
  const { __wyledtagOrFunc, __wyledstatic, __wyledstaticCssId, __wyledklass } = this
  return render(as || __wyledtagOrFunc, Object.assign(iProps, {
    ref,
    className: __wyledklass + ' ' + __wyledstaticCssId + ' ' + (Array.isArray(className) ? className.join(' ') : className)
  }), __wyledstaticCssId, __wyledstatic)
}
const ReactDynamic = function ({ className = '', as, ...iProps }, ref) {
  const { __wyledtagOrFunc, __wyledmapProps, __wyledstrs, __wyledklass } = this
  const theme = useContext(ThemeContext)
  const aProps = __wyledmapProps ? Object.assign(iProps, __wyledmapProps(iProps)) : iProps
  const stylisStr = concatStyles({ props: Object.assign({ theme }, aProps), strs: __wyledstrs })
  const cssId = 'c' + hash(stylisStr)
  const styleStr = getCss(cssId, stylisStr)
  return render(as || __wyledtagOrFunc, Object.assign(aProps, {
    ref,
    className: __wyledklass + ' ' + cssId + ' ' + (Array.isArray(className) ? className.join(' ') : className)
  }), cssId, styleStr)
}
const wyledFromTag = (tagName) => {
  const C = React.forwardRef((props, ref) => React.createElement(tagName, { ...props, ref }))
  return wyledFromFunc(C, tagName)
}
const wyledFromFunc = (C, wyledTagName) => {
  const ctx = C.__wyledctx
    ? Object.assign({}, C.__wyledctx, {
        __wyledstrs: C.__wyledctx.__wyledstrs.slice(0)
      })
    : {
        __wyledtagOrFunc: wyledTagName || C,
        __wyledstrs: [],
        __wyledstatic: ''
      }
  const D = function (raw, ...interps) {
    ctx.__wyledstrs.push([raw, ...interps])
    if (ctx.__wyledstatic !== false && (!interps.length || interps.every(x => typeof (x) !== 'function'))) {
      const stylisStr = concatStyles({ props: {}, strs: ctx.__wyledstrs })
      const cssId = 'c' + hash(stylisStr)
      const styleStr = getCss(cssId, stylisStr)
      ctx.__wyledstaticCssId = cssId
      ctx.__wyledstatic = styleStr
    } else {
      ctx.__wyledstatic = false
    }
    // upon invokation, maybe my props were mapped before
    ctx.__wyledmapProps = D.__wyledmapProps
    const ReactComponent = ctx.__wyledstatic ? ReactStatic : ReactDynamic
    const f = React.forwardRef((...args) => ReactComponent.apply(ctx, args))
    f.__wyledctx = ctx
    f.toString = () => '.' + ctx.__wyledklass
    const id = 'c' + murmur('' + Date.now() + Math.random())
    ctx.__wyledklass = getClass(id, f.displayName)
    // --start fake styled
    f.styledComponentId = id
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
    // --end fake styled
    return new Proxy(f, {
      set (obj, k, v) {
        if (k === 'displayName') {
          obj.displayName = v
          ctx.__wyledklass = getClass(id, v)
          return true
        }
        obj[k] = v
        return true
      }
    })
  }
  D.attrs = mapProps => {
    if (mapProps && mapProps.as) {
      ctx.__wyledtagname = mapProps.as
    } else {
      D.__wyledmapProps = mapProps
    }
    return D
  }

  return D
}
export const wyled = new Proxy(function () {}, {
  get: (target, prop, receiver) => wyledFromTag(prop),
  apply: (target, thisArg, [C]) => wyledFromFunc(C)
})
export const ThemeProvider = ({ theme, children }) => {
  const parent = useContext(ThemeContext)
  const nextTheme = typeof (theme) === 'function'
    ? theme(parent)
    : theme
  return React.createElement(ThemeContext.Provider, { value: Object.assign({}, parent, nextTheme) }, children)
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
export default wyled
