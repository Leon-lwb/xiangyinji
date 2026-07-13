/* ============================================
 * 乡音记 · Modal 弹窗组件
 *
 * 用法：
 *   1. 在根组件包裹 <ModalProvider>...</ModalProvider>
 *   2. 在子组件中调用 const { showModal, closeModal } = useModal()
 *   3. showModal('标题', <内容>, <底部按钮>)
 *
 * 暖色调设计，与 cinema 风格一致。
 * ============================================ */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from 'react'

// ==================== 类型定义 ====================

interface ModalState {
  title: string
  body: ReactNode
  footer?: ReactNode
}

interface ModalContextValue {
  showModal: (title: string, body: ReactNode, footer?: ReactNode) => void
  closeModal: () => void
}

// ==================== Context ====================

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

/**
 * 获取 Modal 上下文
 * 必须在 <ModalProvider> 内部使用
 */
export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('useModal 必须在 <ModalProvider> 内部使用')
  }
  return ctx
}

// ==================== 弹窗视图 ====================

function ModalOverlay({
  modal,
  onClose,
}: {
  modal: ModalState
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)

  // 入场动画
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // 点击遮罩关闭
  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: visible
          ? 'rgba(25, 19, 10, 0.6)'
          : 'rgba(25, 19, 10, 0)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        transition: 'background 0.3s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          background: 'linear-gradient(160deg, #faf7f0 0%, #f5efe4 100%)',
          boxShadow:
            '0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(184,134,11,0.12)',
          overflow: 'hidden',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: visible ? 1 : 0,
          transition:
            'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out',
        }}
      >
        {/* 顶部装饰条 */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #b8860b 0%, #e8a838 50%, #b8860b 100%)',
            flexShrink: 0,
          }}
        />

        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #e8e2d8',
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: '"Noto Serif SC", serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#2d2418',
            }}
          >
            {modal.title}
          </h3>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#8a7f72',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ede7dc'
              e.currentTarget.style.color = '#2d2418'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#8a7f72'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            color: '#5a4f42',
            fontSize: '15px',
            lineHeight: 1.7,
          }}
        >
          {modal.body}
        </div>

        {/* 底部栏 */}
        {modal.footer && (
          <div
            style={{
              padding: '16px 24px 20px',
              borderTop: '1px solid #e8e2d8',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {modal.footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Provider ====================

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const showModal = useCallback(
    (title: string, body: ReactNode, footer?: ReactNode) => {
      setModal({ title, body, footer })
    },
    [],
  )

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modal && <ModalOverlay modal={modal} onClose={closeModal} />}
    </ModalContext.Provider>
  )
}
