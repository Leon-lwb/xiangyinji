/**
 * 乡音记 · anime.js v4 动画工具
 * 提供 scroll-reveal、stagger 入场等可复用动画。
 */
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

/**
 * 滚动揭示：元素进入视口时播放 anime.js 入场动画。
 * 用法：const ref = useScrollReveal()
 *      <div ref={ref} className="scroll-reveal">...</div>
 *      对同一 ref 容器内的子元素设置 .reveal-child 可获得 stagger 效果。
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  delay?: number
  staggerChildren?: number
  y?: number
  duration?: number
}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const {
      delay = 0,
      staggerChildren = 0,
      y = 40,
      duration = 800,
    } = options || {}

    let triggered = false

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true

            if (staggerChildren > 0) {
              const children = el.querySelectorAll('.reveal-child')
              if (children.length > 0) {
                animate(children, {
                  opacity: [0, 1],
                  translateY: [y, 0],
                  duration,
                  delay: stagger(staggerChildren, { start: delay }),
                  ease: 'out(3)',
                })
                return
              }
            }

            animate(el, {
              opacity: [0, 1],
              translateY: [y, 0],
              duration,
              delay,
              ease: 'out(3)',
            })
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}

/**
 * Hero 标题逐字揭示动画。
 * 将文字拆分为单字 span 后用 anime.js 逐字淡入上浮。
 */
export function useHeroTextAnimation<T extends HTMLElement = HTMLHeadingElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 将文本节点中的文字拆分为单字 span
    const splitText = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        const frag = document.createDocumentFragment()
        for (const char of text) {
          if (char.trim()) {
            const span = document.createElement('span')
            span.textContent = char
            span.style.display = 'inline-block'
            span.style.opacity = '0'
            span.classList.add('hero-char')
            frag.appendChild(span)
          } else {
            frag.appendChild(document.createTextNode(char))
          }
        }
        node.parentNode?.replaceChild(frag, node)
      }
    }

    // 递归处理所有子节点
    const walk = (node: Node) => {
      const children = Array.from(node.childNodes)
      children.forEach(splitText)
    }
    walk(el)

    const chars = el.querySelectorAll('.hero-char')
    if (chars.length > 0) {
      animate(chars, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.8, 1],
        duration: 1000,
        delay: stagger(80, { start: 300 }),
        ease: 'out(4)',
      })
    }

    return () => {
      // 清理：anime.js 动画在组件卸载时自动停止
    }
  }, [])

  return ref
}

/**
 * 通用 stagger 入场动画 — 用于卡片网格。
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  childSelector: string,
  staggerMs = 120
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let triggered = false
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true
            const children = el.querySelectorAll(childSelector)
            if (children.length > 0) {
              animate(children, {
                opacity: [0, 1],
                translateY: [50, 0],
                scale: [0.95, 1],
                duration: 800,
                delay: stagger(staggerMs),
                ease: 'out(3)',
              })
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
