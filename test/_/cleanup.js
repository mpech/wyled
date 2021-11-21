import { cleanup } from '@testing-library/react'
import { parseHTML } from 'linkedom'
const { HTMLElement, customElements, window } = parseHTML('<body><main></main></body>')
global.HTMLElement = HTMLElement
global.customElements = customElements
global.document = window.document
global.window = window
export default cleanup
