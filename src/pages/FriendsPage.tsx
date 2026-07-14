import { useState, useCallback, useRef, useEffect } from 'react'
import { matchResults, verifyQuestions, reunionMessages } from '../data'
import type { ReunionMessage } from '../data'
import { useStaggerReveal, useScrollReveal } from '../utils/animations'
import { animate, stagger } from 'animejs'

const STEPS = ['输入记忆', 'AI匹配', '身份核验', '建立联系']
const PRESET_REPLIES = ['是啊，那时候的日子真让人怀念。', '你还记得那条白杨树大街吗？', '改天咱们老地方见个面吧。']

export default function FriendsPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ nickname: '', place: '', era: '1980年代', memory: '' })
  const [matching, setMatching] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [verifyCorrect, setVerifyCorrect] = useState<Record<number, boolean>>({})
  const [chatMessages, setChatMessages] = useState<ReunionMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const particleRef = useRef<HTMLDivElement>(null)
  const matchResultsRef = useStaggerReveal<HTMLDivElement>('.match-card', 150)
  const stepCardRef = useScrollReveal<HTMLDivElement>({ y: 20 })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, typing])

  /* 匹配完成时触发粒子效果 */
  useEffect(() => {
    if (step === 2 && !matching && particleRef.current) {
      const particles = particleRef.current.querySelectorAll('.particle')
      if (particles.length > 0) {
        animate(particles, {
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
          translateX: () => `${(Math.random() - 0.5) * 200}`,
          translateY: () => `${(Math.random() - 0.5) * 200}`,
          duration: 1500,
          delay: stagger(50),
          ease: 'out(3)',
        })
      }
    }
  }, [step, matching])

  const handleStartSearch = useCallback(() => {
    if (!formData.nickname && !formData.place) return
    setStep(2)
    setMatching(true)
    setTimeout(() => {
      setMatching(false)
    }, 2400)
  }, [formData])

  const handleSelectMatch = useCallback((id: number) => {
    setSelectedMatch(id)
  }, [])

  const handleVerify = useCallback((qi: number, oi: number) => {
    const correct = verifyQuestions[qi].answer === oi
    if (correct) {
      setVerifyCorrect((prev) => ({ ...prev, [qi]: true }))
    }
  }, [])

  const allVerified = Object.keys(verifyCorrect).length === verifyQuestions.length

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setChatMessages((prev) => [...prev, { sender: 'self', text: chatInput, time: now }])
    setChatInput('')
    setTyping(true)
    setTimeout(() => {
      const replyIdx = chatMessages.filter((m) => m.sender === 'other').length % PRESET_REPLIES.length
      setChatMessages((prev) => [...prev, { sender: 'other', text: PRESET_REPLIES[replyIdx], time: now }])
      setTyping(false)
    }, 1400)
  }, [chatInput, chatMessages])

  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#2d2418]">
      {/* 暗色渐变Hero */}
      <div className="page-hero-dark page-hero-glow px-4 pb-16 pt-32 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">故人寻踪</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-cinema-fg sm:text-5xl">
          寻找老朋友
        </h1>
        <p className="mt-4 text-lg text-cinema-muted">
          输入模糊记忆片段，AI 跨区域匹配可能的老友
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Steps Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                step > i + 1 ? 'border-[#b8860b] bg-[#b8860b] text-white' :
                step === i + 1 ? 'border-[#b8860b] bg-[#fdf5e0] text-[#b8860b] scale-110' :
                'border-[#d4c5a9] bg-white text-[#8a7f72]'
              }`}>
                <span className="text-sm font-bold">{i + 1}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-12 ${step > i + 1 ? 'bg-[#b8860b]' : 'bg-[#d4c5a9]'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div ref={stepCardRef} className="card-hover rounded-2xl border border-[#e8e2d8] bg-white p-6 shadow-sm opacity-0">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#5a4f42]">方言小名 / 绰号</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="如：老张头、铁柱"
                  className="w-full rounded-xl border border-[#e8e2d8] px-4 py-3 text-base focus:border-[#b8860b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#5a4f42]">常去的地方</label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  placeholder="如：石景山老厂区、子弟学校"
                  className="w-full rounded-xl border border-[#e8e2d8] px-4 py-3 text-base focus:border-[#b8860b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#5a4f42]">大概年代</label>
                <select
                  value={formData.era}
                  onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                  className="w-full rounded-xl border border-[#e8e2d8] px-4 py-3 text-base focus:border-[#b8860b] focus:outline-none"
                >
                  <option>1970年代</option>
                  <option>1980年代</option>
                  <option>1990年代</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#5a4f42]">其他记忆碎片</label>
                <textarea
                  value={formData.memory}
                  onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                  placeholder="如：一起在厂门口等下班、跳皮筋…"
                  rows={3}
                  className="w-full rounded-xl border border-[#e8e2d8] px-4 py-3 text-base focus:border-[#b8860b] focus:outline-none"
                />
              </div>
              <button
                onClick={handleStartSearch}
                disabled={!formData.nickname && !formData.place}
                className="w-full rounded-xl bg-[#b8860b] py-4 text-base font-semibold text-white transition-colors hover:bg-[#9a7309] disabled:opacity-40"
              >
                开始寻找
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              {matching ? (
                <div className="flex flex-col items-center py-12">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fdf5e0] border-t-[#b8860b]" />
                  <p className="mt-4 text-lg text-[#5a4f42]">AI 正在跨区域匹配…</p>
                </div>
              ) : (
                <>
                  {/* 粒子效果容器 */}
                  <div ref={particleRef} className="pointer-events-none relative mb-4 flex justify-center">
                    {[...Array(20)].map((_, i) => (
                      <span
                        key={i}
                        className="particle absolute h-2 w-2 rounded-full bg-[#b8860b]"
                        style={{ opacity: 0 }}
                      />
                    ))}
                  </div>
                  <h3 className="mb-4 font-serif text-xl font-bold text-[#2d2418]">找到 {matchResults.length} 位可能的老友</h3>
                  <div ref={matchResultsRef} className="space-y-3">
                    {matchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMatch(m.id)}
                        className={`match-card cursor-pointer rounded-xl border-2 p-4 opacity-0 transition-all hover:shadow-md ${
                          selectedMatch === m.id ? 'border-[#b8860b] bg-[#fdf5e0]' : 'border-[#e8e2d8]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <img src={m.avatar} alt={m.nickname} className="h-16 w-16 rounded-full border-2 border-[#e8e2d8] object-cover" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-lg font-bold text-[#2d2418]">{m.nickname}</span>
                              <span className="rounded-md bg-[#fdf5e0] px-2 py-0.5 text-xs font-semibold text-[#b8860b]">{m.matchScore}% 匹配</span>
                            </div>
                            <p className="mt-1 text-sm text-[#8a7f72]">{m.era} · {m.place}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {m.commonGround.map((g, i) => (
                                <span key={i} className="rounded-full bg-[#f5efe4] px-2 py-0.5 text-xs text-[#5a4f42]">{g}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => setStep(1)} className="rounded-xl border border-[#e8e2d8] px-6 py-3 text-sm font-semibold text-[#5a4f42] hover:bg-[#faf7f0]">上一步</button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={selectedMatch === null}
                      className="flex-1 rounded-xl bg-[#b8860b] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9a7309] disabled:opacity-40"
                    >
                      下一步
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#5a4f42]">核验进度</span>
                  <span className="text-sm font-bold text-[#b8860b]">{Object.keys(verifyCorrect).length} / {verifyQuestions.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f0ebe2]">
                  <div className="h-full rounded-full bg-[#b8860b] transition-all duration-500" style={{ width: `${(Object.keys(verifyCorrect).length / verifyQuestions.length) * 100}%` }} />
                </div>
              </div>
              {allVerified && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                  <p className="font-serif text-lg font-bold text-green-700">核验通过</p>
                  <p className="text-sm text-green-600">身份确认，可以建立联系</p>
                </div>
              )}
              <div className="space-y-4">
                {verifyQuestions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-[#e8e2d8] p-4">
                    <p className="mb-3 font-semibold text-[#2d2418]">{qi + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => handleVerify(qi, oi)}
                          disabled={verifyCorrect[qi]}
                          className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                            verifyCorrect[qi] && q.answer === oi ? 'bg-green-100 text-green-700 border border-green-300' :
                            verifyCorrect[qi] ? 'bg-[#f5efe4] text-[#8a7f72]' :
                            'bg-[#faf7f0] text-[#5a4f42] border border-[#e8e2d8] hover:border-[#b8860b]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {!verifyCorrect[qi] && (
                      <p className="mt-2 text-xs text-[#8a7f72]">提示：{q.hint}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={() => setStep(2)} className="rounded-xl border border-[#e8e2d8] px-6 py-3 text-sm font-semibold text-[#5a4f42] hover:bg-[#faf7f0]">上一步</button>
                <button
                  onClick={() => { setStep(4); setChatMessages(reunionMessages) }}
                  disabled={!allVerified}
                  className="flex-1 rounded-xl bg-[#b8860b] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9a7309] disabled:opacity-40"
                >
                  建立联系
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="mb-4 flex items-center gap-3 border-b border-[#e8e2d8] pb-3">
                <img src={matchResults.find(m => m.id === selectedMatch)?.avatar} alt="" className="h-12 w-12 rounded-full border-2 border-[#e8e2d8]" />
                <div>
                  <p className="font-serif text-lg font-bold text-[#2d2418]">{matchResults.find(m => m.id === selectedMatch)?.nickname}</p>
                  <p className="text-xs text-green-600">✓ 身份已核验</p>
                </div>
              </div>
              <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender === 'self' ? 'bg-[#b8860b] text-white' : 'bg-[#f5efe4] text-[#2d2418]'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`mt-1 text-xs ${msg.sender === 'self' ? 'text-white/60' : 'text-[#8a7f72]'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[#f5efe4] px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8a7f72]" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8a7f72]" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#8a7f72]" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                  placeholder="输入消息…"
                  className="flex-1 rounded-xl border border-[#e8e2d8] px-4 py-3 text-base focus:border-[#b8860b] focus:outline-none"
                />
                <button onClick={handleSendMessage} className="rounded-xl bg-[#b8860b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#9a7309]">发送</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
