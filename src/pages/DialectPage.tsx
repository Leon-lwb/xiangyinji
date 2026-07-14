/**
 * 乡音记 · 乡音互通模块
 *
 * 功能：
 * 1. 方向切换：老人说方言→子女看普通话（old2young）/ 子女打字→老人听方言（young2old）
 * 2. 语音输入：Web Speech API SpeechRecognition，不支持时降级为模拟输入（预设样本 + 打字机效果）
 * 3. 翻译核心：遍历方言词典正则全局替换，收集被替换词作为注释标签
 * 4. 翻译结果卡片：原文/译文 + 注释标签 + 复制/播报
 * 5. 对话历史：左右气泡布局，方言原文 + AI翻译双气泡 + 播报按钮
 * 6. 方言词典搜索：按方言/普通话/地区三字段模糊搜索
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { dialectConversations, dialectDict, dialectInputs } from '../data'
import type { DialectConversation } from '../data'
import {
  createSpeechRecognition,
  isSpeechSupported,
  isTTSSupported,
  speak,
} from '../utils/speech'
import type { SpeechRecognitionController } from '../utils/speech'
import {
  translateDialectToMandarin,
  translateMandarinToDialect,
} from '../utils/translate'
import type { TranslateResult } from '../utils/translate'
import { useStaggerReveal, useScrollReveal } from '../utils/animations'
import { animate, stagger } from 'animejs'

type Direction = 'old2young' | 'young2old'

/** 录音话筒图标 */
function MicIcon({ recording }: { recording: boolean }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

/** 喇叭图标 */
function SpeakerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

export default function DialectPage() {
  /* -------------------- 状态 -------------------- */
  const [direction, setDirection] = useState<Direction>('old2young')
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState<TranslateResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [partialText, setPartialText] = useState('') // 打字机/识别中文字
  const [history, setHistory] = useState<DialectConversation[]>(dialectConversations)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [copied, setCopied] = useState(false)
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionController | null>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const dictRef = useStaggerReveal<HTMLDivElement>('.dict-row', 40)
  const historyRef = useScrollReveal<HTMLDivElement>({ y: 20 })

  /* 翻译结果出现时的动画 */
  useEffect(() => {
    if (result && resultRef.current) {
      animate(resultRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.97, 1],
        duration: 600,
        ease: 'out(3)',
      })
    }
  }, [result])

  /* -------------------- 清理副作用 -------------------- */
  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current)
      recognitionRef.current?.stop()
    }
  }, [])

  /* -------------------- 翻译 -------------------- */
  const doTranslate = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const res: TranslateResult =
        direction === 'old2young'
          ? translateDialectToMandarin(trimmed)
          : translateMandarinToDialect(trimmed)
      setResult(res)
      // 同步加入对话历史（最新置顶）
      const entry: DialectConversation = {
        id: Date.now(),
        speaker: direction === 'old2young' ? '老人' : '子女',
        original: trimmed,
        translation: res.translated,
        time: '刚刚',
      }
      setHistory((prev) => [entry, ...prev])
    },
    [direction],
  )

  /* -------------------- 打字机效果（降级模拟输入） -------------------- */
  const runTypewriter = useCallback((text: string, onDone?: () => void) => {
    if (typewriterRef.current) clearInterval(typewriterRef.current)
    setPartialText('')
    let i = 0
    typewriterRef.current = setInterval(() => {
      i += 1
      setPartialText(text.slice(0, i))
      if (i >= text.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current)
        onDone?.()
      }
    }, 70)
  }, [])

  /* -------------------- 语音输入 -------------------- */
  const handleMic = useCallback(() => {
    // 正在录音则停止
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    // 支持语音识别：真实识别
    if (isSpeechSupported()) {
      const controller = createSpeechRecognition({
        onStart: () => {
          setIsRecording(true)
          setPartialText('')
        },
        onResult: (transcript) => {
          setIsRecording(false)
          setInputText(transcript)
          setPartialText('')
          doTranslate(transcript)
        },
        onError: () => {
          setIsRecording(false)
          setPartialText('')
        },
        onEnd: () => setIsRecording(false),
      })
      if (controller) {
        recognitionRef.current = controller
        controller.start()
        return
      }
    }

    // 降级：从预设样本随机取一条，打字机效果显示
    const sample =
      dialectInputs[Math.floor(Math.random() * dialectInputs.length)]
    setIsRecording(true)
    runTypewriter(sample, () => {
      setIsRecording(false)
      setInputText(sample)
      setPartialText('')
      doTranslate(sample)
    })
  }, [isRecording, doTranslate, runTypewriter])

  /* -------------------- 播报 -------------------- */
  const handlePlay = useCallback(
    (text: string, key: string) => {
      if (!isTTSSupported()) return
      // 正在播报同一条则停止
      if (speakingKey === key) {
        window.speechSynthesis.cancel()
        setSpeakingKey(null)
        return
      }
      setSpeakingKey(key)
      speak(text, {
        rate: 0.85,
        onEnd: () => setSpeakingKey(null),
      })
    },
    [speakingKey],
  )

  /* -------------------- 复制 -------------------- */
  const handleCopy = useCallback((text: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
        .catch(() => {})
    }
  }, [])

  /* -------------------- 切换方向 -------------------- */
  const switchDirection = useCallback((d: Direction) => {
    setDirection(d)
    setInputText('')
    setResult(null)
    setPartialText('')
    if (typewriterRef.current) clearInterval(typewriterRef.current)
  }, [])

  /* -------------------- 词典搜索 -------------------- */
  const keyword = searchKeyword.trim()
  const filteredDict = keyword
    ? dialectDict.filter(
        (d) =>
          d.dialect.includes(keyword) ||
          d.mandarin.includes(keyword) ||
          d.region.includes(keyword),
      )
    : dialectDict

  const sourceLabel = direction === 'old2young' ? '方言' : '普通话'
  const targetLabel = direction === 'old2young' ? '普通话' : '方言'

  /* ============================================
     渲染
     ============================================ */
  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#2d2418]">
      {/* 暗色渐变Hero */}
      <div className="page-hero-dark page-hero-glow px-4 pb-16 pt-32 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">乡音互通</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-cinema-fg sm:text-5xl">
          说一句乡音，跨越代际
        </h1>
        <p className="mt-4 text-lg text-cinema-muted">
          AI 实时翻译方言，让老人和子女无障碍沟通
        </p>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* ========== 方向切换（胶囊式） ========== */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-1.5 rounded-full bg-[#efe7d6] p-1.5">
            <button
              onClick={() => switchDirection('old2young')}
              className={`rounded-full px-5 py-3 text-base font-medium transition-all ${
                direction === 'old2young'
                  ? 'bg-[#b8860b] text-white shadow-md'
                  : 'text-[#5a4f42] hover:text-[#2d2418]'
              }`}
            >
              老人说方言 → 子女看普通话
            </button>
            <button
              onClick={() => switchDirection('young2old')}
              className={`rounded-full px-5 py-3 text-base font-medium transition-all ${
                direction === 'young2old'
                  ? 'bg-[#b8860b] text-white shadow-md'
                  : 'text-[#5a4f42] hover:text-[#2d2418]'
              }`}
            >
              子女打字 → 老人听方言
            </button>
          </div>
        </div>

        {/* ========== 输入区 ========== */}
        <section className="card-hover mb-6 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {direction === 'old2young' ? '请说出方言' : '请输入普通话'}
            </h2>
            {direction === 'old2young' && !isSpeechSupported() && (
              <span className="rounded-full bg-[#fdf2e0] px-3 py-1 text-xs text-[#d97706]">
                语音不可用 · 已启用模拟输入
              </span>
            )}
          </div>

          {direction === 'old2young' ? (
            <div className="flex flex-col items-center gap-4">
              {/* 录音按钮（≥64px，录音中脉冲动画） */}
              <button
                onClick={handleMic}
                aria-label={isRecording ? '停止录音' : '开始录音'}
                className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all ${
                  isRecording
                    ? 'bg-red-500'
                    : 'bg-[#b8860b] hover:bg-[#9a7309] active:scale-95'
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-60" />
                )}
                <span className="relative">
                  <MicIcon recording={isRecording} />
                </span>
              </button>
              <p className="min-h-[1.5em] text-center text-base text-[#5a4f42]">
                {isRecording
                  ? partialText
                    ? `识别中：${partialText}`
                    : '正在聆听…'
                  : '点击话筒开始说话'}
              </p>

              {/* 手动输入兜底 */}
              <div className="flex w-full gap-2">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="或手动输入方言…"
                  className="min-h-[48px] flex-1 rounded-xl border border-[#e8e2d8] bg-[#faf7f0] px-4 py-3 text-base outline-none focus:border-[#b8860b]"
                />
                <button
                  onClick={() => doTranslate(inputText)}
                  className="min-h-[48px] rounded-xl bg-[#b8860b] px-6 text-base font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
                >
                  翻译
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入普通话，翻译成方言给老人听…"
                rows={3}
                className="rounded-xl border border-[#e8e2d8] bg-[#faf7f0] px-4 py-3 text-lg leading-relaxed outline-none focus:border-[#b8860b]"
              />
              <button
                onClick={() => doTranslate(inputText)}
                className="min-h-[52px] rounded-xl bg-[#b8860b] px-6 text-lg font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
              >
                翻译成方言
              </button>
            </div>
          )}
        </section>

        {/* ========== 翻译结果卡片 ========== */}
        {result && (
          <section ref={resultRef} className="card-hover mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.12)]">
            {/* 原文 */}
            <div className="mb-3">
              <p className="text-xs text-[#9a8f7e]">原文（{sourceLabel}）</p>
              <p className="mt-1 text-lg leading-relaxed text-[#5a4f42]">
                {inputText}
              </p>
            </div>
            {/* 译文 */}
            <div className="mb-3 border-t border-[#f0ebe2] pt-3">
              <p className="text-xs text-[#9a8f7e]">译文（{targetLabel}）</p>
              <p className="mt-1 text-xl font-semibold leading-relaxed text-[#2d2418]">
                {result.translated}
              </p>
            </div>
            {/* 注释标签 */}
            {result.notes.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {result.notes.map((n, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#fdf5e0] px-3 py-1 text-sm font-medium text-[#b8860b]"
                  >
                    {n.original} → {n.replacement}
                  </span>
                ))}
              </div>
            )}
            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(result.translated)}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#e8d9b8] bg-[#fdf5e0] px-5 text-base font-medium text-[#8a6a09] transition-colors hover:bg-[#f7ebcc]"
              >
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={() => handlePlay(result.translated, 'result')}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#e8d9b8] bg-[#fdf5e0] px-5 text-base font-medium text-[#8a6a09] transition-colors hover:bg-[#f7ebcc]"
              >
                <SpeakerIcon />
                {speakingKey === 'result' ? '停止' : '播报'}
              </button>
            </div>
          </section>
        )}

        {/* ========== 对话历史（左右气泡） ========== */}
        <section ref={historyRef} className="card-hover mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.10)] opacity-0">
          <h2 className="mb-4 text-lg font-semibold">对话历史</h2>
          <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
            {history.map((c) => {
              const isOld = c.speaker === '老人'
              return (
                <div
                  key={c.id}
                  className={`flex ${isOld ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`flex w-[82%] flex-col gap-1.5 ${
                      isOld ? 'items-start' : 'items-end'
                    }`}
                  >
                    <span className="text-xs text-[#9a8f7e]">
                      {c.speaker} · {c.time}
                    </span>
                    {/* 原文气泡 */}
                    <div
                      className={`max-w-full rounded-2xl px-4 py-3 text-base leading-relaxed ${
                        isOld
                          ? 'rounded-tl-sm bg-[#fdf5e0] text-[#5a4f42]'
                          : 'rounded-tr-sm bg-[#e8f0e6] text-[#3a5a38]'
                      }`}
                    >
                      {c.original}
                    </div>
                    {/* AI 译气泡 */}
                    <div className="max-w-full rounded-2xl rounded-bl-sm bg-[#fbf6ec] px-4 py-3 shadow-sm">
                      <span className="text-xs font-medium text-[#b8860b]">
                        AI 译
                      </span>
                      <p className="mt-0.5 text-lg font-medium leading-relaxed text-[#2d2418]">
                        {c.translation}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlay(c.translation, `h-${c.id}`)}
                      className={`flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                        speakingKey === `h-${c.id}`
                          ? 'bg-[#b8860b] text-white'
                          : 'bg-[#f0e9da] text-[#8a6a09] hover:bg-[#e8dfc6]'
                      }`}
                    >
                      <SpeakerIcon />
                      {speakingKey === `h-${c.id}` ? '停止' : '播报'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========== 方言词典搜索 ========== */}
        <section className="card-hover mb-10 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
          <h2 className="mb-4 text-lg font-semibold">方言词典</h2>
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索方言词 / 普通话 / 地区…"
            className="mb-4 min-h-[48px] w-full rounded-xl border border-[#e8e2d8] bg-[#faf7f0] px-4 py-3 text-base outline-none focus:border-[#b8860b]"
          />
          <div ref={dictRef} className="flex flex-col divide-y divide-[#f0ebe2]">
            {filteredDict.length === 0 ? (
              <p className="py-6 text-center text-base text-[#9a8f7e]">
                没有找到相关词条
              </p>
            ) : (
              filteredDict.map((d, i) => (
                <div
                  key={i}
                  className="dict-row flex items-center gap-3 py-3 text-base opacity-0"
                >
                  <span className="min-w-[4.5em] font-semibold text-[#b8860b]">
                    {d.dialect}
                  </span>
                  <span className="text-[#c4b89e]">→</span>
                  <span className="text-[#2d2418]">{d.mandarin}</span>
                  <span className="ml-auto rounded-full bg-[#f5efe4] px-3 py-0.5 text-sm text-[#7a6f5e]">
                    {d.region}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
