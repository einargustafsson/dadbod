import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { collectSummary, requestReview } from '../coach/weeklyReview'
import { getSettings } from '../db/schema'
import { useApp } from '../store'
import { Button, Card } from '../ui'

export function Coach() {
  const settings = useLiveQuery(getSettings, [])
  const setTab = useApp((s) => s.setTab)
  const [busy, setBusy] = useState(false)
  const [review, setReview] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  if (!settings) return null

  async function run() {
    setBusy(true)
    setError('')
    try {
      setReview(await requestReview(await collectSummary(), settings!.claudeKey!))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function showPreview() {
    setPreview(preview ? '' : JSON.stringify(await collectSummary(), null, 2))
  }

  return (
    <Card>
      <div className="font-semibold">Weekly review (Claude)</div>
      <p className="mt-1 text-sm text-slate-400">
        Sends a 4-week summary (weights, lift trends, weekly run km) to the Claude API. No notes or personal details.
        Advice only; it never changes your plan.
      </p>
      <div className="mt-3 flex gap-2">
        {settings.claudeKey ? (
          <Button disabled={busy} onClick={run}>{busy ? 'Thinking…' : 'Get review'}</Button>
        ) : (
          <Button variant="ghost" onClick={() => setTab('settings')}>Add API key in Settings</Button>
        )}
        <Button variant="ghost" onClick={showPreview}>{preview ? 'Hide data' : 'Preview data'}</Button>
      </div>
      {preview && <pre className="mt-3 max-h-60 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-300">{preview}</pre>}
      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      {review && <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{review}</div>}
    </Card>
  )
}
