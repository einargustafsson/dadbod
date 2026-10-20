import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-slate-800 p-4 ${className}`}>{children}</div>
}

export function Button({
  variant = 'primary', className = '', ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-sky-500 text-slate-950 font-semibold',
    ghost: 'bg-slate-700 text-slate-100',
    danger: 'bg-rose-600 text-white',
  }[variant]
  return (
    <button
      className={`rounded-lg px-4 py-3 text-sm active:opacity-80 disabled:opacity-40 ${styles} ${className}`}
      {...rest}
    />
  )
}

export function H({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</h2>
}

export const inputCls =
  'w-full rounded-lg bg-slate-900 px-3 py-2 text-base text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-sky-500'

/** Parses user-typed numbers, accepting a comma as the decimal separator (e.g. "92,5"). */
export function parseNum(s: string): number {
  return Number(s.trim().replace(',', '.'))
}

export function fmtKg(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
