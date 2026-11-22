import { defineConfig } from 'vite'
import { JSDOM } from 'jsdom'
export default defineConfig(async () => {
  const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: 'http://localhost/', pretendToBeVisual: true })
  const g = globalThis, w = dom.window
  g.window = w; g.document = w.document
  for (const k of ['HTMLElement','Element','Node','SVGElement','Event','MouseEvent','KeyboardEvent','CustomEvent','MutationObserver','getComputedStyle','requestAnimationFrame','HTMLInputElement','Document','DocumentFragment','Text','Comment','HTMLTextAreaElement','HTMLSelectElement','location','history','localStorage','sessionStorage'])
    Object.defineProperty(g, k, { value: w[k], configurable: true, writable: true })
  Object.defineProperty(g, 'navigator', { value: w.navigator, configurable: true })
  g.addEventListener = w.addEventListener.bind(w); g.removeEventListener = w.removeEventListener.bind(w); g.scrollTo = () => {}; w.scrollTo = () => {}
  const vue = (await import('@vitejs/plugin-vue')).default
  return { plugins: [vue()], optimizeDeps: { noDiscovery: true, include: [] } }
})
