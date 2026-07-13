/* ============================================
 * 乡音记 · Toast 通知组件
 *
 * 用法：
 *   1. 在根组件包裹 <ToastProvider>...</ToastProvider>
 *   2. 在子组件中调用 const { showToast } = useToast()
 *   3. showToast('保存成功', 'success')
 *
 * 暖色调设计，与 cinema 风格一致。
 * ============================================ */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

// ==================== 类型定义 ====================

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  title?: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void
}

// ==================== Context ====================

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

/**
 * 获取 Toast 上下文
 * 必须在 <ToastProvider> 内部使用
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast 必须在 <ToastProvider> 内部使用')
  }
  return ctx
}

// ==================== 样式配置 ====================

const TOAST_AUTO_DISMISS_MS = 3500

const typeConfig: Record<
  ToastType,
  { accent: string; icon: ReactNode; label: string }
> = {
  success: {
    accent: '#7ab675',
    label: '成功',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    accent: '#d4574a',
    label: '错误',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  info: {
    accent: '#b8860b',
    label: '提示',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  warning: {
    accent: '#e8a838',
    label: '警告',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
}

// ==================== 单条 Toast 卡片 ====================

function ToastCard({ toast }: { toast: ToastItem }) {
  const [visible, setVisible] = useState(false)
  const config = typeConfig[toast.type]

  useEffect(() => {
    // 下一帧触发入场动画
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '420px',
        padding: '14px 18px',
        borderRadius: '12px',
        background: 'rgba(45, 36, 24, 0.92)',
        backdropFilter: 'blur(12px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
        borderLeft: `4px solid ${config.accent}`,
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.08)',
        color: 'hsl(40, 25%, 92%)',
        fontSize: '14px',
        lineHeight: 1.6,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-out',
      }}
    >
      {/* 图标 */}
      <span
        style={{
          flexShrink: 0,
          marginTop: '2px',
          color: config.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {config.icon}
      </span>

      {/* 内容 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div
            style={{
              fontWeight: 700,
              fontSize: '15px',
              marginBottom: '2px',
              color: config.accent,
            }}
          >
            {toast.title}
          </div>
        )}
        <div style={{ wordBreak: 'break-word' }}>{toast.message}</div>
      </div>
    </div>
  )
}

// ==================== Provider ====================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idCounter = useRef(0)

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = ++idCounter.current
      setToasts((prev) => [...prev, { id, message, type, title }])

      // 3.5 秒后自动移除
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, TOAST_AUTO_DISMISS_MS)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast 容器 —— 固定在右上角 */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastCard toast={toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
