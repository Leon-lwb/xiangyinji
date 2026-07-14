import { useState, useRef, useCallback, useEffect } from 'react'
import { memoryPhotos, memoryTimeline } from '../data'
import type { MemoryPhoto } from '../data'
import { speak } from '../utils/speech'
import { useStaggerReveal } from '../utils/animations'

/* ============================================
   今昔对比滑块组件
   ============================================ */
function ComparisonSlider({ photo }: { photo: MemoryPhoto }) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(0, Math.min(100, x)))
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMove(e.clientX)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches[0]) handleMove(e.touches[0].clientX)
    }
    const onStop = () => { isDragging.current = false }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onStop)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onStop)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onStop)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onStop)
    }
  }, [handleMove])

  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-[#8a7f72] px-2 py-0.5 text-xs font-semibold text-white">今昔对比</span>
        <span className="text-sm text-[#8a7f72]">拖动滑块查看变化</span>
      </div>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl select-none"
        style={{ aspectRatio: '16/9', cursor: 'ew-resize' }}
        onMouseDown={(e) => { isDragging.current = true; handleMove(e.clientX) }}
        onTouchStart={(e) => { isDragging.current = true; if (e.touches[0]) handleMove(e.touches[0].clientX) }}
      >
        {/* 底层：今（彩色） */}
        <img
          src={photo.image}
          alt={`${photo.title} - 今`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">今 · {photo.newDesc}</span>

        {/* 上层：昔（怀旧滤镜），用 clip-path 控制显示区域 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={photo.image}
            alt={`${photo.title} - 昔`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'sepia(0.7) contrast(0.9) brightness(0.85)' }}
            draggable={false}
          />
          <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-amber-200">昔 · {photo.oldDesc}</span>
        </div>

        {/* 滑块分割线 */}
        <div
          className="absolute top-0 bottom-0 z-10 flex items-center justify-center"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/20 backdrop-blur-sm shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemoryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null)
  const [detailRef] = useState({ current: null as HTMLDivElement | null })
  const detailAreaRef = useRef<HTMLDivElement>(null)
  const timelineRef = useStaggerReveal<HTMLDivElement>('.timeline-item', 100)

  const handleSelectPhoto = useCallback((photo: MemoryPhoto) => {
    setSelectedPhoto(photo)
    setTimeout(() => {
      detailAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#2d2418]">
      {/* 暗色渐变Hero */}
      <div className="page-hero-dark page-hero-glow px-4 pb-16 pt-32 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">记忆地图</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-cinema-fg sm:text-5xl">
          时空记忆地图
        </h1>
        <p className="mt-4 text-lg text-cinema-muted">
          在地图上标注老照片的拍摄地点，重建岁月记忆坐标系
        </p>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* SVG Map */}
        <div className="card-hover mb-8 overflow-hidden rounded-2xl border border-[#e8e2d8] bg-white shadow-sm">
          <div className="relative w-full" style={{ aspectRatio: '8/5' }}>
            <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full">
              {/* Background */}
              <rect width="800" height="500" fill="#fdfbf6" />
              {/* Grid */}
              {[...Array(11)].map((_, i) => (
                <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="500" stroke="#f0ebe2" strokeWidth="1" />
              ))}
              {[...Array(7)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="#f0ebe2" strokeWidth="1" />
              ))}
              {/* River */}
              <path d="M 0 350 Q 200 320 400 340 T 800 310" stroke="#a0c4d8" strokeWidth="20" fill="none" opacity="0.6" />
              {/* Roads */}
              <line x1="400" y1="0" x2="400" y2="500" stroke="#d4c5a9" strokeWidth="8" />
              <line x1="0" y1="250" x2="800" y2="250" stroke="#d4c5a9" strokeWidth="8" />
              {/* Buildings */}
              <rect x="180" y="120" width="60" height="40" fill="#8b7355" rx="4" />
              <rect x="420" y="180" width="50" height="35" fill="#8b7355" rx="4" />
              <rect x="520" y="340" width="55" height="38" fill="#8b7355" rx="4" />
              <rect x="280" y="400" width="50" height="35" fill="#8b7355" rx="4" />
              <rect x="620" y="160" width="50" height="35" fill="#8b7355" rx="4" />
              {/* Trees */}
              <circle cx="160" cy="200" r="8" fill="#5b8c5a" opacity="0.6" />
              <circle cx="500" cy="280" r="8" fill="#5b8c5a" opacity="0.6" />
              <circle cx="300" cy="320" r="8" fill="#5b8c5a" opacity="0.6" />
              <circle cx="650" cy="380" r="8" fill="#5b8c5a" opacity="0.6" />
              {/* Title */}
              <text x="400" y="30" textAnchor="middle" fontSize="16" fill="#8a7f72" fontFamily="serif">岁月地图</text>
              {/* Compass */}
              <text x="750" y="470" textAnchor="middle" fontSize="14" fill="#b8860b">N ↑</text>
            </svg>

            {/* Photo Markers */}
            {memoryPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => handleSelectPhoto(photo)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                style={{ left: `${photo.x}%`, top: `${photo.y}%` }}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition-all ${selectedPhoto?.id === photo.id ? 'h-8 w-8 bg-[#c0563a]' : 'bg-[#b8860b]'}`}>
                  <span className="text-xs font-bold text-white">{photo.id}</span>
                </span>
                {selectedPhoto?.id === photo.id && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#b8860b] opacity-30" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Detail */}
        <div ref={detailAreaRef} className="scroll-mt-28">
          {selectedPhoto ? (
            <div className="card-hover mb-8 rounded-2xl border border-[#e8e2d8] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-lg bg-[#fdf5e0] px-3 py-1 text-sm font-bold text-[#b8860b]">{selectedPhoto.year}</span>
                <h2 className="font-serif text-2xl font-bold text-[#2d2418]">{selectedPhoto.title}</h2>
                <span className="text-sm text-[#8a7f72]">{selectedPhoto.place}</span>
              </div>
              {selectedPhoto.hasComparison ? (
                <ComparisonSlider photo={selectedPhoto} />
              ) : (
                <img src={selectedPhoto.image} alt={selectedPhoto.title} className="mb-4 w-full rounded-xl object-cover" style={{ maxHeight: '300px' }} />
              )}
              <p className="mb-4 text-lg leading-relaxed text-[#5a4f42]">{selectedPhoto.story}</p>
              <button
                onClick={() => speak(selectedPhoto.story)}
                className="rounded-lg bg-[#b8860b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9a7309]"
              >
                朗读故事
              </button>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed border-[#d4c5a9] bg-[#fdfbf6] p-12 text-center">
              <p className="text-lg text-[#8a7f72]">点击地图上的标记，查看老照片和记忆故事</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#2d2418]">人生时间轴</h2>
          <div ref={timelineRef} className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#b8860b] to-[#e8e2d8]" />
            {memoryTimeline.map((item, i) => (
              <div key={i} className="timeline-item relative mb-6 last:mb-0 opacity-0">
                <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-[#b8860b] bg-white" />
                <div className="card-hover rounded-xl border border-[#e8e2d8] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-bold text-[#b8860b]">{item.year}</span>
                    <span className="rounded-md bg-[#fdf5e0] px-2 py-0.5 text-sm font-semibold text-[#b8860b]">{item.event}</span>
                    <span className="text-sm text-[#8a7f72]">{item.place}</span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-[#5a4f42]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
