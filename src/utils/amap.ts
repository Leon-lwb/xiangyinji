/**
 * 乡音记 · 高德地图动态加载器
 * 在需要时动态注入高德JS API script，避免首屏加载延迟。
 */

const AMAP_KEY = '4c28a5ebbe26523b05b39ff85854cf54'
const AMAP_SECURITY_CODE = 'a1b2c3d4e5f6'

let loaded = false
let loadingPromise: Promise<void> | null = null

/** 设置安全密钥（必须在script加载前设置） */
function setupSecurityCode() {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>)._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_CODE,
  }
}

/** 动态加载高德地图JS API */
export function loadAMap(): Promise<void> {
  if (loaded && typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).AMap) {
    return Promise.resolve()
  }
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document not available'))
      return
    }

    setupSecurityCode()

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    script.async = true
    script.onload = () => {
      loaded = true
      resolve()
    }
    script.onerror = () => {
      loadingPromise = null
      reject(new Error('Failed to load AMap SDK'))
    }
    document.head.appendChild(script)
  })

  return loadingPromise
}

/** 获取AMap全局对象 */
export function getAMap(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, unknown>
  return (w.AMap as Record<string, unknown> | null) ?? null
}
