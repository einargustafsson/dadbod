import { useEffect, useState } from 'react'

const FRAME_MS = 800

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Loops the start and end position of an exercise. Shows both frames side by side if motion is reduced. */
export function ExerciseAnimation({ id, name }: { id: string; name: string }) {
  const [frame, setFrame] = useState<0 | 1>(0)
  const reduced = useReducedMotion()
  const src = (i: 0 | 1) => `${import.meta.env.BASE_URL}exercises/${id}/${i}.jpg`

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), FRAME_MS)
    return () => clearInterval(t)
  }, [reduced])

  if (reduced) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-2">
        <img className="rounded-lg" src={src(0)} alt={`${name}: start position`} />
        <img className="rounded-lg" src={src(1)} alt={`${name}: end position`} />
      </div>
    )
  }
  return (
    <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-lg bg-slate-800">
      {/* Both frames stay mounted so the second is already loaded when the loop flips. */}
      <img className="absolute inset-0 h-full w-full object-cover" src={src(0)} alt={`${name}: start and end position`}
        style={{ opacity: frame === 0 ? 1 : 0 }} />
      <img className="absolute inset-0 h-full w-full object-cover" src={src(1)} alt="" aria-hidden
        style={{ opacity: frame === 1 ? 1 : 0 }} />
    </div>
  )
}
