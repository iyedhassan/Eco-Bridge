import { ReactNode } from 'react'

export function StatCard({ title, value, helper, icon }: { title: string; value: string; helper?: string; icon?: ReactNode }) {
  return (
    <article className="eco-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase tracking-wide text-eco-600">{title}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-eco-900">{value}</p>
      {helper ? <p className="mt-1 text-sm font-medium text-eco-700">{helper}</p> : null}
    </article>
  )
}
