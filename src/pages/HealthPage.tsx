/**
 * 乡音记 · 认知守护模块
 *
 * 功能：
 * 1. 本周认知趋势图：自绘 SVG 折线图，7 天数据，渐变面积填充、网格线、
 *    Y 轴标签(70-100)、X 轴标签(周一到周日)、数据点 tooltip
 * 2. 今日认知小测：5 题流程（第 1 题记忆阶段 + 第 2-5 题选择题），
 *    答对绿色、答错红色并显示正确答案，结果页含百分比/评级/重新测评
 * 3. 健康提醒列表：按 level(warning/info/success) 渲染卡片
 * 4. 邻里互助看护板：帖子列表，已完成显示"已处理"，未完成显示"我来帮忙"按钮
 */
import { useEffect, useMemo, useState } from 'react'
import {
  cognitiveQuiz,
  healthAlerts,
  healthTrend,
  neighborHelps,
} from '../data'
import type { HealthAlertLevel, NeighborHelp } from '../data'
import { speak } from '../utils/speech'

/* 小测阶段 */
type QuizPhase = 'intro' | 'memory' | 'quiz' | 'result'

/* 健康提醒样式映射 */
const ALERT_STYLES: Record<
  HealthAlertLevel,
  { bg: string; border: string; accent: string; icon: string; label: string }
> = {
  warning: {
    bg: 'bg-[#fef3e2]',
    border: 'border-[#e8b96b]',
    accent: 'text-[#d97706]',
    icon: '!',
    label: '提醒',
  },
  info: {
    bg: 'bg-[#fdf5e0]',
    border: 'border-[#e0d0a0]',
    accent: 'text-[#b8860b]',
    icon: 'i',
    label: '通知',
  },
  success: {
    bg: 'bg-[#ecf5ec]',
    border: 'border-[#9cc89c]',
    accent: 'text-[#4a7a4a]',
    icon: '✓',
    label: '完成',
  },
}

/* ============================================
   SVG 认知趋势折线图
   ============================================ */
function TrendChart() {
  const [hover, setHover] = useState<number | null>(null)

  // 图表几何参数
  const PAD_LEFT = 40
  const PAD_RIGHT = 20
  const PAD_TOP = 20
  const PAD_BOTTOM = 40
  const W = 360
  const H = 220
  const plotW = W - PAD_LEFT - PAD_RIGHT
  const plotH = H - PAD_TOP - PAD_BOTTOM
  const Y_MIN = 70
  const Y_MAX = 100

  const points = useMemo(
    () =>
      healthTrend.map((d, i) => {
        const x = PAD_LEFT + (i * plotW) / (healthTrend.length - 1)
        const y = PAD_TOP + plotH - ((d.value - Y_MIN) / (Y_MAX - Y_MIN)) * plotH
        return { x, y, ...d }
      }),
    [plotW, plotH],
  )

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath =
    `M ${points[0].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} Z`

  const yTicks = [70, 80, 90, 100]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="本周认知趋势折线图"
    >
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8860b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#b8860b" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 网格线 + Y 轴标签 */}
      {yTicks.map((v) => {
        const y = PAD_TOP + plotH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * plotH
        return (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={W - PAD_RIGHT}
              y2={y}
              stroke="#e8e2d8"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9a8f7e"
            >
              {v}
            </text>
          </g>
        )
      })}

      {/* X 轴标签（周一到周日） */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - PAD_BOTTOM + 22}
          textAnchor="middle"
          fontSize="12"
          fill="#7a6f5e"
        >
          {p.day}
        </text>
      ))}

      {/* 面积填充 */}
      <path d={areaPath} fill="url(#trendArea)" />

      {/* 折线 */}
      <path
        d={linePath}
        fill="none"
        stroke="#b8860b"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 数据点 + tooltip */}
      {points.map((p, i) => (
        <g
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* 透明热区，方便鼠标命中 */}
          <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
          <circle
            cx={p.x}
            cy={p.y}
            r={hover === i ? 6 : 4}
            fill="#fff"
            stroke="#b8860b"
            strokeWidth="2.5"
          />
          {hover === i && (
            <g>
              <rect
                x={p.x - 24}
                y={p.y - 34}
                width="48"
                height="24"
                rx="6"
                fill="#2d2418"
              />
              <text
                x={p.x}
                y={p.y - 17}
                textAnchor="middle"
                fontSize="13"
                fill="#fff"
                fontWeight="600"
              >
                {p.value} 分
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

/* ============================================
   认知小测
   ============================================ */
function CognitiveQuiz() {
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [countdown, setCountdown] = useState(5)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const questions = cognitiveQuiz.questions
  const current = questions[qIndex]

  /* 记忆阶段倒计时 */
  useEffect(() => {
    if (phase !== 'memory') return
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          setPhase('quiz')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  /* 重置到介绍页 */
  const reset = () => {
    setPhase('intro')
    setQIndex(0)
    setSelected(null)
    setLocked(false)
    setShowHint(false)
    setCorrectCount(0)
  }

  /* 选择选项 */
  const handleSelect = (idx: number) => {
    if (locked) return
    setSelected(idx)
    setLocked(true)
    if (idx === current.answer) setCorrectCount((c) => c + 1)
  }

  /* 下一题 */
  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setLocked(false)
      setShowHint(false)
    } else {
      setPhase('result')
    }
  }

  /* 朗读记忆词语 */
  const speakWords = () => {
    speak(cognitiveQuiz.memoryWords.join('，'), { rate: 0.8 })
  }

  const total = questions.length
  const percent = Math.round((correctCount / total) * 100)
  const rating =
    percent >= 80
      ? { text: '优秀', color: 'text-[#4a7a4a]', bg: 'bg-[#ecf5ec]' }
      : percent >= 60
        ? { text: '良好', color: 'text-[#b8860b]', bg: 'bg-[#fdf5e0]' }
        : { text: '需关注', color: 'text-[#d97706]', bg: 'bg-[#fef3e2]' }

  /* ---- 介绍页 ---- */
  if (phase === 'intro') {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
        <h3 className="text-xl font-semibold">今日认知小测</h3>
        <p className="mt-2 text-base text-[#7a6f5e]">
          共 5 题，先记 3 个词，再回答 4 道选择题。
          <br />
          坚持每天测一测，守护记忆不掉队。
        </p>
        <button
          onClick={() => setPhase('memory')}
          className="mt-6 min-h-[52px] w-full rounded-xl bg-[#b8860b] px-6 text-lg font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
        >
          开始测评
        </button>
      </div>
    )
  }

  /* ---- 记忆阶段（第 1 题，不计分） ---- */
  if (phase === 'memory') {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
        <p className="text-sm text-[#b8860b]">第 1 题 · 记忆阶段（不计分）</p>
        <h3 className="mt-2 text-xl font-semibold">请记住下面三个词</h3>

        <div className="my-6 flex items-center justify-center gap-3">
          {cognitiveQuiz.memoryWords.map((w) => (
            <span
              key={w}
              className="rounded-2xl bg-[#fdf5e0] px-6 py-4 text-2xl font-bold text-[#b8860b]"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="mb-4 text-5xl font-bold text-[#d97706]">
          {countdown}
          <span className="ml-1 text-xl text-[#9a8f7e]">秒</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0e9da]">
          <div
            className="h-full rounded-full bg-[#b8860b] transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 5) * 100}%` }}
          />
        </div>

        <button
          onClick={speakWords}
          className="mt-5 min-h-[44px] rounded-xl border border-[#e8d9b8] bg-[#fdf5e0] px-5 text-base font-medium text-[#8a6a09] transition-colors hover:bg-[#f7ebcc]"
        >
          朗读词语
        </button>
      </div>
    )
  }

  /* ---- 结果页 ---- */
  if (phase === 'result') {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
        <h3 className="text-xl font-semibold">测评结果</h3>
        <div className="my-6">
          <span className="text-6xl font-bold text-[#b8860b]">{percent}</span>
          <span className="text-2xl text-[#9a8f7e]">分</span>
        </div>
        <div
          className={`mx-auto inline-block rounded-full px-6 py-2 text-lg font-bold ${rating.bg} ${rating.color}`}
        >
          {rating.text}
        </div>
        <p className="mt-4 text-base text-[#5a4f42]">
          答对 {correctCount} / {total} 题
        </p>
        <p className="mt-2 text-sm text-[#9a8f7e]">
          {percent >= 80
            ? '认知状态很好，继续保持每日训练！'
            : percent >= 60
              ? '状态尚可，可以多做一些回忆练习。'
              : '建议多陪伴练习，必要时关注认知健康。'}
        </p>
        <button
          onClick={reset}
          className="mt-6 min-h-[52px] w-full rounded-xl bg-[#b8860b] px-6 text-lg font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
        >
          重新测评
        </button>
      </div>
    )
  }

  /* ---- 选择题（第 2-5 题） ---- */
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[#b8860b]">
          第 {current.id} 题 · 共 5 题
        </span>
        <span className="text-sm text-[#9a8f7e]">
          已答对 {correctCount} 题
        </span>
      </div>

      <h3 className="mb-5 text-xl font-semibold leading-relaxed">
        {current.question}
      </h3>

      <div className="flex flex-col gap-3">
        {current.options.map((opt, idx) => {
          const isCorrect = idx === current.answer
          const isSelected = idx === selected
          let cls =
            'min-h-[52px] rounded-xl border-2 px-5 text-left text-lg transition-all '
          if (!locked) {
            cls += 'border-[#e8e2d8] bg-[#faf7f0] hover:border-[#b8860b] hover:bg-[#fdf5e0] text-[#2d2418]'
          } else if (isCorrect) {
            cls += 'border-[#4a7a4a] bg-[#ecf5ec] text-[#2d5a2d]'
          } else if (isSelected) {
            cls += 'border-[#d97706] bg-[#fef3e2] text-[#9a5406]'
          } else {
            cls += 'border-[#e8e2d8] bg-[#faf7f0] text-[#9a8f7e]'
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={locked}
              className={cls}
            >
              <span className="mr-2 font-semibold">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
              {locked && isCorrect && (
                <span className="float-right text-[#4a7a4a]">✓ 正确</span>
              )}
              {locked && isSelected && !isCorrect && (
                <span className="float-right text-[#d97706]">✗ 你的选择</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 提示 */}
      {!locked && (
        <button
          onClick={() => setShowHint((s) => !s)}
          className="mt-4 text-base font-medium text-[#b8860b] underline-offset-2 hover:underline"
        >
          {showHint ? '收起提示' : '需要提示？'}
        </button>
      )}
      {showHint && !locked && (
        <p className="mt-2 rounded-xl bg-[#fdf5e0] px-4 py-3 text-base text-[#8a6a09]">
          💡 {current.hint}
        </p>
      )}

      {/* 答题反馈 */}
      {locked && (
        <div className="mt-4 rounded-xl bg-[#f7f3ea] px-4 py-3">
          <p
            className={`text-base font-semibold ${
              selected === current.answer
                ? 'text-[#4a7a4a]'
                : 'text-[#d97706]'
            }`}
          >
            {selected === current.answer
              ? '答对了，真棒！'
              : `答错了，正确答案是 ${String.fromCharCode(65 + current.answer)}. ${current.options[current.answer]}`}
          </p>
          <p className="mt-1 text-base text-[#5a4f42]">{current.explanation}</p>
        </div>
      )}

      {/* 下一题 */}
      {locked && (
        <button
          onClick={handleNext}
          className="mt-5 min-h-[52px] w-full rounded-xl bg-[#b8860b] px-6 text-lg font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
        >
          {qIndex < questions.length - 1 ? '下一题' : '查看结果'}
        </button>
      )}
    </div>
  )
}

/* ============================================
   主页面
   ============================================ */
export default function HealthPage() {
  const [helps, setHelps] = useState<NeighborHelp[]>(neighborHelps)

  const handleHelp = (id: number) => {
    setHelps((prev) =>
      prev.map((h) => (h.id === id ? { ...h, resolved: true } : h)),
    )
  }

  // 周平均分
  const avg = useMemo(() => {
    const sum = healthTrend.reduce((s, d) => s + d.value, 0)
    return Math.round(sum / healthTrend.length)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf7f0] px-4 py-6 text-[#2d2418]">
      <div className="mx-auto max-w-3xl">
        {/* ========== 标题 ========== */}
        <header className="mb-6 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            认知守护
          </h1>
          <p className="mt-2 text-base text-[#7a6f5e]">
            每日小测，追踪趋势，邻里守望，守护记忆
          </p>
        </header>

        {/* ========== 本周认知趋势图 ========== */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">本周认知趋势</h2>
            <span className="rounded-full bg-[#fdf5e0] px-3 py-1 text-sm font-medium text-[#b8860b]">
              周均 {avg} 分
            </span>
          </div>
          <TrendChart />
          <p className="mt-1 text-center text-sm text-[#9a8f7e]">
            鼠标悬停数据点查看每日得分
          </p>
        </section>

        {/* ========== 今日认知小测 ========== */}
        <section className="mb-6">
          <CognitiveQuiz />
        </section>

        {/* ========== 健康提醒列表 ========== */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
          <h2 className="mb-4 text-lg font-semibold">健康提醒</h2>
          <div className="flex flex-col gap-3">
            {healthAlerts.map((alert) => {
              const s = ALERT_STYLES[alert.level]
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-xl border ${s.border} ${s.bg} p-4`}
                >
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold ${s.accent}`}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#2d2418]">
                        {alert.title}
                      </h3>
                      <span
                        className={`rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium ${s.accent}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-1 text-base leading-relaxed text-[#5a4f42]">
                      {alert.desc}
                    </p>
                    <p className="mt-1 text-sm text-[#9a8f7e]">{alert.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========== 邻里互助看护板 ========== */}
        <section className="mb-10 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(184,134,11,0.10)]">
          <h2 className="mb-4 text-lg font-semibold">邻里互助看护板</h2>
          <div className="flex flex-col gap-3">
            {helps.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-[#f0ebe2] bg-[#fcfaf4] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-[#2d2418]">
                    {h.title}
                  </h3>
                  {h.resolved ? (
                    <span className="flex-shrink-0 rounded-full bg-[#ecf5ec] px-3 py-1 text-sm font-medium text-[#4a7a4a]">
                      已处理
                    </span>
                  ) : (
                    <button
                      onClick={() => handleHelp(h.id)}
                      className="flex-shrink-0 rounded-full bg-[#b8860b] px-4 py-1.5 text-sm font-medium text-white shadow transition-colors hover:bg-[#9a7309]"
                    >
                      我来帮忙
                    </button>
                  )}
                </div>
                <p className="mt-2 text-base leading-relaxed text-[#5a4f42]">
                  {h.desc}
                </p>
                <p className="mt-2 text-sm text-[#9a8f7e]">
                  {h.author} · {h.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
