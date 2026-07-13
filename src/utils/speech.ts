/**
 * 乡音记 · 语音工具
 * 封装 Web Speech API：语音识别（SpeechRecognition）与语音合成（TTS）。
 * 在浏览器不支持时提供安全的降级行为。
 */

/** 语音识别回调集合 */
export interface SpeechRecognitionHandlers {
  /** 识别到最终结果时触发 */
  onResult?: (transcript: string) => void
  /** 识别出错时触发 */
  onError?: (error: string) => void
  /** 识别开始时触发 */
  onStart?: () => void
  /** 识别结束时触发 */
  onEnd?: () => void
}

/** 语音识别控制器 */
export interface SpeechRecognitionController {
  /** 开始识别 */
  start: () => void
  /** 停止识别 */
  stop: () => void
}

/**
 * 判断当前浏览器是否支持语音识别（SpeechRecognition）。
 */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
}

/**
 * 判断当前浏览器是否支持语音合成（TTS）。
 */
export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * 创建一个语音识别控制器。
 * 不支持时返回 null，调用方需自行降级（如模拟输入）。
 *
 * @param handlers 识别过程中的回调
 * @param lang 识别语言，默认中文
 */
export function createSpeechRecognition(
  handlers: SpeechRecognitionHandlers,
  lang = 'zh-CN',
): SpeechRecognitionController | null {
  if (!isSpeechSupported()) return null

  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => unknown })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => unknown })
      .webkitSpeechRecognition
  if (!Ctor) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition: any = new Ctor()
  recognition.lang = lang
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const transcript: string = event.results?.[0]?.[0]?.transcript ?? ''
    if (transcript) handlers.onResult?.(transcript)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    handlers.onError?.(event?.error ?? 'unknown')
  }
  recognition.onstart = () => handlers.onStart?.()
  recognition.onend = () => handlers.onEnd?.()

  return {
    start: () => {
      try {
        recognition.start()
      } catch {
        // 重复 start 等情况下忽略错误
      }
    },
    stop: () => {
      try {
        recognition.stop()
      } catch {
        // 忽略
      }
    },
  }
}

/** speak 选项 */
export interface SpeakOptions {
  /** 朗读语言，默认中文 */
  lang?: string
  /** 语速 0.1-10，默认 0.9（适合老人听清） */
  rate?: number
  /** 音高 0-2，默认 1 */
  pitch?: number
  /** 朗读结束回调 */
  onEnd?: () => void
}

/**
 * 用语音合成朗读一段文本。
 * 不支持时直接调用 onEnd，便于上层流程继续。
 */
export function speak(text: string, options?: SpeakOptions): void {
  if (!isTTSSupported()) {
    options?.onEnd?.()
    return
  }
  const synth = window.speechSynthesis
  synth.cancel() // 取消上一次朗读，避免堆积

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = options?.lang ?? 'zh-CN'
  utter.rate = options?.rate ?? 0.9
  utter.pitch = options?.pitch ?? 1
  if (options?.onEnd) utter.onend = options.onEnd
  synth.speak(utter)
}

/**
 * 停止当前正在进行的语音合成。
 */
export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel()
  }
}
