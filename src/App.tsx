import { useEffect, useRef, useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import DialectPage from './pages/DialectPage'
import MemoryPage from './pages/MemoryPage'
import FriendsPage from './pages/FriendsPage'
import HealthPage from './pages/HealthPage'

/**
 * 乡音记 · 沉浸式双视频 Crossfade 首页
 *
 * 交互逻辑（每次点击触发一次）：
 * 1. 初始状态：Video A 可见（老人背影），Video B 隐藏
 * 2. 用户点击"聆听乡音"
 * 3. 播放 radio-voice.mp3（"原来你在这儿"）
 * 4. 音频播放完毕后，交叉淡化到 Video B（年轻小伙在金色稻田）
 * 5. Video B 显示数秒后，淡回 Video A
 * 6. 等待下一次点击
 */

const VIDEO_B_DISPLAY_MS = 5000 // Video B 显示时长
const CROSSFADE_MS = 1500 // 交叉淡化时长

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [showVideoB, setShowVideoB] = useState(false)
  const [isTriggering, setIsTriggering] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  /* ============================================
     清理所有定时器
     ============================================ */
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => clearAllTimers()
  }, [clearAllTimers])

  /* ============================================
     滚动监听
     ============================================ */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ============================================
     核心交互：点击"聆听乡音"
     ============================================ */
  const handleTriggerMemory = useCallback(() => {
    if (isTriggering) return // 正在播放中，忽略重复点击
    setIsTriggering(true)
    clearAllTimers()

    // 1. 播放收音机音效
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    // 2. 确保 Video A 正在播放（老人背影）
    if (videoARef.current) {
      videoARef.current.play().catch(() => {})
    }

    // 3. 音频播放完毕后，触发交叉淡化到 Video B
    const triggerCrossfade = () => {
      // 确保 Video B 从头播放
      if (videoBRef.current) {
        videoBRef.current.currentTime = 0
        videoBRef.current.play().catch(() => {})
      }
      // 切换到 Video B
      setShowVideoB(true)

      // 4. Video B 显示一段时间后，淡回 Video A
      const fadeBack = setTimeout(() => {
        setShowVideoB(false)
        // 等淡化完成后重置状态
        const reset = setTimeout(() => {
          setIsTriggering(false)
          timersRef.current = timersRef.current.filter((t) => t !== reset)
        }, CROSSFADE_MS + 200)
        timersRef.current.push(reset)
        timersRef.current = timersRef.current.filter((t) => t !== fadeBack)
      }, VIDEO_B_DISPLAY_MS + CROSSFADE_MS)
      timersRef.current.push(fadeBack)
    }

    // 监听音频结束，或使用超时兜底
    const audio = audioRef.current
    if (audio) {
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded)
        // 短暂延迟，让"转头"动作有时间
        const delay = setTimeout(triggerCrossfade, 500)
        timersRef.current.push(delay)
      }
      audio.addEventListener('ended', onEnded)

      // 兜底：如果音频事件未触发，8秒后强制交叉淡化
      const fallback = setTimeout(() => {
        audio.removeEventListener('ended', onEnded)
        triggerCrossfade()
      }, 8000)
      timersRef.current.push(fallback)
    } else {
      // 没有音频，直接交叉淡化
      triggerCrossfade()
    }
  }, [isTriggering, clearAllTimers])

  /* ============================================
     渲染
     ============================================ */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-cinema-bg text-cinema-fg">
      {/* ==================== 导航栏 ==================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/40 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <div className="font-serif text-2xl font-bold tracking-tight text-cinema-fg cursor-pointer" onClick={() => navigate('/')}>
              归田记<sup className="ml-0.5 text-xs">®</sup>
            </div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: '首页', path: '/' },
              { label: '乡音互通', path: '/dialect' },
              { label: '记忆地图', path: '/memory' },
              { label: '故人寻踪', path: '/friends' },
              { label: '认知守护', path: '/health' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-sm transition-colors hover:text-cinema-fg ${
                  location.pathname === link.path ? 'text-cinema-fg' : 'text-cinema-muted'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleTriggerMemory}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-cinema-fg transition-transform hover:scale-[1.03]"
          >
            回到那一天
          </button>
        </div>
      </nav>

      {/* ==================== 页面路由 ==================== */}
      <Routes>
        <Route path="/" element={<>
      {/* ==================== Hero — 双视频交叉淡化 ==================== */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video A — 现在：客厅望阳台（老张背影） */}
        <video
          ref={videoARef}
          className="ken-burns-a cinema-video absolute inset-0 z-0 h-full w-full object-cover"
          style={{
            opacity: showVideoB ? 0 : 1,
            transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          }}
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/cinema-living-room.jpg"
        >
          <source src="/assets/video-a.mp4" type="video/mp4" />
        </video>

        {/* Video B — 过去：金色稻田（年轻面庞微笑） */}
        <video
          ref={videoBRef}
          className="ken-burns-b cinema-video absolute inset-0 z-0 h-full w-full object-cover"
          style={{
            opacity: showVideoB ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
          }}
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/cinema-golden-fields.jpg"
        >
          <source src="/assets/video-b.mp4" type="video/mp4" />
        </video>

        {/* 暗角晕影 */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 0%, transparent 30%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.5) 100%), linear-gradient(to bottom, rgba(25,19,10,0.4) 0%, transparent 20%, transparent 70%, rgba(25,19,10,0.8) 100%)',
          }}
        />

        {/* 内容层 */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1
            className="animate-fade-rise font-serif text-5xl font-normal leading-[0.95] tracking-[-0.02em] text-cinema-fg sm:text-7xl md:text-8xl"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
          >
            一声<em className="not-italic text-cinema-primary">乡音</em>，
            恍若<em className="not-italic text-cinema-primary">隔世</em>。
          </h1>

          <p
            className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-cinema-muted sm:text-lg"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}
          >
            客厅的收音机还在沙沙作响，风里却传来了五十年前的声音。
            <br />
            回头望去，阳台变成了无边的稻田，而你，还是十八岁的模样。
          </p>

          <button
            onClick={handleTriggerMemory}
            disabled={isTriggering}
            className={`liquid-glass animate-fade-rise-delay-2 mt-12 flex items-center gap-2.5 rounded-full px-14 py-5 text-base text-cinema-fg transition-transform hover:scale-[1.03] cursor-pointer ${
              isTriggering ? 'opacity-60 cursor-wait' : ''
            }`}
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 256 256"
              fill="currentColor"
              className="text-cinema-primary"
            >
              <path d="M128,176a48,48,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48,48,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,203.6V240h16a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16h16v27.6A80.11,80.11,0,0,0,48,320a8,8,0,0,0,16,0,64.07,64.07,0,0,1,63.5-63.99c.17,0,.33.05.5.05s.33-.05.5-.05A64.07,64.07,0,0,1,192,320a8,8,0,0,0,16,0A80.11,80.11,0,0,0,136,267.6Z" />
            </svg>
            <span>{isTriggering ? '播放中…' : '聆听乡音'}</span>
          </button>
        </div>

        {/* 向下滚动提示 */}
        <div className="animate-fade-rise-delay-2 absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-cinema-muted">
            向下探索
          </span>
          <div className="scroll-pulse h-10 w-px bg-gradient-to-b from-cinema-muted to-transparent" />
        </div>
      </section>

      {/* ==================== 暗→亮过渡带 ==================== */}
      <div
        className="relative z-10 h-[120px]"
        style={{
          background:
            'linear-gradient(to bottom, hsl(25,30%,8%) 0%, rgba(25,19,10,0.6) 30%, rgba(250,247,240,0.3) 70%, #faf7f0 100%)',
          marginTop: '-1px',
        }}
      />

      {/* ==================== 内容区域 ==================== */}
      <section className="bg-[#faf7f0] px-6 py-24 text-[#2d2418]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
            关于乡音记
          </p>
          <h2 className="mb-8 font-serif text-4xl font-bold tracking-tight">
            以乡音为纽带，以旧地为坐标
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-[#5a4f42]">
            乡音记是一个为老年人打造的AI适老化平台。我们用方言翻译打破代际隔阂，
            用记忆地图重建岁月坐标，用故人寻踪连接失散的老友，用认知守护守护每一天的记忆。
          </p>
          <p className="text-lg leading-relaxed text-[#5a4f42]">
            从一声乡音开始，找回岁月里的温暖。
          </p>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { title: '乡音互通', desc: '全方言高容错语音交互，老人说方言，AI自动翻译成普通话文字给子女看。', path: '/dialect' },
              { title: '时空记忆地图', desc: '在地图上标注老照片的拍摄地点，AI自动识别年代、生成故事，支持今昔对比。', path: '/memory' },
              { title: '故人寻踪', desc: '输入模糊记忆片段，AI跨区域匹配可能的老友，三重身份核验保障安全。', path: '/friends' },
              { title: '认知守护', desc: '每日趣味方言认知小测，AI追踪记忆曲线趋势，异常自动预警子女。', path: '/health' },
            ].map((mod, i) => (
              <div
                key={mod.title}
                onClick={() => navigate(mod.path)}
                className="group relative cursor-pointer rounded-2xl border border-[#e8e2d8] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="absolute inset-[5px] rounded-xl border border-[#f0ebe2] opacity-60 transition-opacity group-hover:opacity-100"
                  style={{ pointerEvents: 'none' }}
                />
                <div className="relative z-10">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#fdf5e0] font-serif text-2xl font-bold text-[#b8860b]">
                    {i + 1}
                  </span>
                  <h3 className="mb-3 font-serif text-xl font-bold">{mod.title}</h3>
                  <p className="text-[0.95rem] leading-relaxed text-[#5a4f42]">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 底部 CTA ==================== */}
      <section className="bg-[#f5efe4] px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
            开始使用
          </p>
          <h2 className="mb-6 font-serif text-3xl font-bold leading-snug text-[#2d2418]">
            让每一句<span className="text-[#b8860b]">乡音</span>都被听见
            <br />
            让每一段<span className="text-[#b8860b]">记忆</span>都被珍视
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-[#5a4f42]">
            乡音记，不只是翻译工具，更是连接两代人情感的桥梁。
          </p>
          <button
            onClick={handleTriggerMemory}
            disabled={isTriggering}
            className="rounded-xl bg-[#b8860b] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#9a7309] hover:shadow-xl disabled:opacity-60 disabled:cursor-wait"
          >
            {isTriggering ? '播放中…' : '聆听乡音'}
          </button>
        </div>
      </section>

        </>} />
        <Route path="/dialect" element={<DialectPage />} />
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/health" element={<HealthPage />} />
      </Routes>

      {/* ==================== 底部 ==================== */}
      <footer className="bg-[#2d2418] py-8 text-center text-sm text-[#8a7f72]">
        <p>乡音记 · 老地方遇故人 &copy; 2026</p>
      </footer>

      {/* ==================== 音频元素 ==================== */}
      <audio ref={audioRef} src="/assets/radio-voice.mp3" preload="auto" />
    </div>
  )
}
