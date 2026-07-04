import { AlertCircle } from 'lucide-react'

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="eco-card border-dashed border-eco-200 bg-eco-50/70 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-eco-700">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-display text-xl font-extrabold text-eco-900">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-eco-700">{subtitle}</p>
    </section>
  )
}
