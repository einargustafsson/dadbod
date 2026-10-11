import { Log } from './screens/Log'
import { Progress } from './screens/Progress'
import { Session } from './screens/Session'
import { Settings } from './screens/Settings'
import { Today } from './screens/Today'
import { useApp, type Tab } from './store'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'progress', label: 'Progress' },
  { id: 'log', label: 'Log' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const { tab, setTab, openSessionId } = useApp()
  if (openSessionId !== null) return <Session id={openSessionId} />

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <main className="flex-1 p-4 pb-24">
        {tab === 'today' && <Today />}
        {tab === 'progress' && <Progress />}
        {tab === 'log' && <Log />}
        {tab === 'settings' && <Settings />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-xl grid-cols-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-4 text-sm ${tab === t.id ? 'font-semibold text-sky-400' : 'text-slate-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
