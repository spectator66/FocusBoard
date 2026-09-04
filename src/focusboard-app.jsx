import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, Check, Clock3, Download, Flame, Moon, MoreHorizontal, Play, Plus, RotateCcw, Settings2, Sparkles, Sun, Target, TimerReset, Trash2, X, Coffee } from 'lucide-react'
import './focusboard.css'

const demoTasks = [
  { id: 1, title: '完成产品体验走查', tag: '产品', color: 'orange', done: false, time: '09:30', priority: '高' },
  { id: 2, title: '整理本周用户访谈洞察', tag: '研究', color: 'violet', done: false, time: '11:00', priority: '中' },
  { id: 3, title: '写项目周报', tag: '写作', color: 'blue', done: false, time: '15:00', priority: '中' },
  { id: 4, title: '回复关键协作消息', tag: '沟通', color: 'green', done: true, time: '16:30', priority: '低' },
]
const categories = { 产品: 'orange', 研究: 'violet', 写作: 'blue', 沟通: 'green', 生活: 'pink', 待安排: 'blue' }
const modes = { focus: { label: '专注', minutes: 25 }, short: { label: '短休息', minutes: 5 }, long: { label: '长休息', minutes: 15 } }
const quotes = ['先做最重要的那一件。', '把注意力留给真正重要的事。', '今天也值得被认真度过。']
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }

function App() {
  const [tasks, setTasks] = useState(() => load('focusboard-tasks', demoTasks))
  const [intention, setIntention] = useState(() => localStorage.getItem('focusboard-intention') || '')
  const [sessions, setSessions] = useState(() => Number(localStorage.getItem('focusboard-sessions') || 16))
  const [mode, setMode] = useState('focus')
  const [seconds, setSeconds] = useState(modes.focus.minutes * 60)
  const [running, setRunning] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [draft, setDraft] = useState({ title: '', tag: '待安排', time: '稍后', priority: '中' })
  const [toast, setToast] = useState('')
  const [dark, setDark] = useState(() => localStorage.getItem('focusboard-theme') === 'dark')

  const done = tasks.filter(task => task.done).length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const activeTask = tasks.find(task => !task.done) || tasks[0]
  const total = modes[mode].minutes * 60
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const weeklyBars = useMemo(() => [34, 48, 39, 66, 51, 85, Math.max(30, Math.min(96, sessions * 4))], [sessions])
  const recovered = `${Math.floor((sessions * 25) / 60)} 小时 ${String((sessions * 25) % 60).padStart(2, '0')} 分`
  const notify = message => { setToast(message); window.setTimeout(() => setToast(''), 2600) }

  useEffect(() => localStorage.setItem('focusboard-tasks', JSON.stringify(tasks)), [tasks])
  useEffect(() => localStorage.setItem('focusboard-intention', intention), [intention])
  useEffect(() => localStorage.setItem('focusboard-sessions', String(sessions)), [sessions])
  useEffect(() => { localStorage.setItem('focusboard-theme', dark ? 'dark' : 'light'); document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => {
    if (!running) return
    const tick = window.setInterval(() => setSeconds(value => {
      if (value > 1) return value - 1
      window.clearInterval(tick); setRunning(false)
      if (mode === 'focus') setSessions(count => count + 1)
      notify(mode === 'focus' ? '一轮专注完成，做得很好。' : '休息结束，准备好再出发。')
      return 0
    }), 1000)
    return () => window.clearInterval(tick)
  }, [running, mode])

  const chooseMode = next => { setRunning(false); setMode(next); setSeconds(modes[next].minutes * 60) }
  const toggleTask = id => setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task))
  const removeTask = id => { setTasks(current => current.filter(task => task.id !== id)); notify('任务已移除') }
  const resetTimer = () => { setRunning(false); setSeconds(total) }
  const saveTask = event => { event.preventDefault(); if (!draft.title.trim()) return; setTasks(current => [...current, { ...draft, id: Date.now(), title: draft.title.trim(), color: categories[draft.tag], done: false }]); setDraft({ title: '', tag: '待安排', time: '稍后', priority: '中' }); setDialog(null); notify('新任务已加入今天的清单') }
  const exportData = () => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), tasks, intention, sessions }, null, 2)], { type: 'application/json' })); link.download = 'focusboard-backup.json'; link.click(); URL.revokeObjectURL(link.href); notify('数据备份已下载') }
  const resetDemo = () => { setTasks(demoTasks); setIntention(''); setSessions(16); chooseMode('focus'); setDialog(null); notify('已恢复示例数据') }
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return <main className="fb-shell">
    <header className="fb-topbar"><a className="fb-brand" href="#top"><span><Sparkles size={17}/></span>focusboard</a><nav><button className="active" onClick={() => go('today')}>今天</button><button onClick={() => go('focus')}>专注</button><button onClick={() => go('review')}>复盘</button></nav><div className="fb-actions"><button className="fb-icon" aria-label="设置" onClick={() => setDialog('settings')}><Settings2 size={18}/></button><div className="fb-avatar">林</div></div></header>

    <section className="fb-hero" id="top"><div className="fb-date"><span>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).replaceAll('/', ' / ')}</span><i></i><span>今天</span></div><div className="fb-hero-grid"><div><p className="fb-eyebrow">GOOD MORNING, LIN</p><h1>让今天，<em>清晰发生。</em></h1><p>{quotes[new Date().getDate() % quotes.length]}<br/>你的节奏，由你决定。</p></div><div className="fb-hero-side"><div className="fb-streak"><span><Flame size={21}/></span><div><b>{Math.max(1, Math.floor(sessions / 2))} 天</b><small>连续专注</small></div></div><button className="fb-primary" onClick={() => setDialog('task')}><Plus size={17}/>新建任务</button></div></div></section>

    <section className="fb-grid" id="today"><div><div className="fb-heading"><div><p className="fb-eyebrow">TODAY'S AGENDA</p><h2>今日清单 <small>{tasks.length}</small></h2></div><button onClick={() => setDialog('task')}>添加任务 <ArrowUpRight size={15}/></button></div><div className="fb-agenda">{tasks.length ? tasks.map((task, index) => <article className={task.done ? 'done' : ''} key={task.id}><button className="fb-check" aria-label={`标记 ${task.title} 完成`} onClick={() => toggleTask(task.id)}>{task.done && <Check size={14}/>}</button><div className="fb-task"><strong>{task.title}</strong><span className={`fb-tag ${task.color}`}>{task.tag}</span><span className="fb-priority">{task.priority}优先级</span></div><div className="fb-time"><Clock3 size={14}/>{task.time}</div><button className="fb-delete" aria-label={`删除 ${task.title}`} onClick={() => removeTask(task.id)}><Trash2 size={16}/></button>{index === 0 && !task.done && <b className="fb-now">现在</b>}</article>) : <div className="fb-empty"><Check size={20}/><p>今天的清单是空的。</p><button onClick={() => setDialog('task')}>添加第一件事</button></div>}<button className="fb-add-line" onClick={() => setDialog('task')}><Plus size={17}/>添加一件想完成的事</button></div><button className={`fb-intention ${intention ? 'written' : ''}`} onClick={() => setDialog('intention')}><span><Target size={21}/></span><div><p className="fb-eyebrow">DAILY INTENTION</p><h3>{intention || '今天的重点是什么？'}</h3><p>{intention ? '点击修改今天的方向。' : '为今天写下一句方向，它会在忙碌时提醒你。'}</p></div><i>写下它 <ArrowUpRight size={15}/></i></button></div>
      <aside id="focus"><section className="fb-focus"><div className="fb-card-head"><div><p className="fb-eyebrow">FOCUS SESSION</p><h2>专注时刻</h2></div><button className="fb-icon dim" aria-label="重置计时器" onClick={resetTimer}><MoreHorizontal size={18}/></button></div><div className="fb-modes">{Object.entries(modes).map(([key, item]) => <button className={mode === key ? 'selected' : ''} key={key} onClick={() => chooseMode(key)}>{item.label}</button>)}</div><div className="fb-timer"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="68"/><circle className="fb-ring" cx="80" cy="80" r="68" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - (seconds / total * 100)}/></svg><div><b>{time}</b><span>{modes[mode].label}</span></div></div><p className="fb-focus-task"><i></i>{activeTask?.title || '清空清单，享受片刻空白'}</p><div className="fb-focus-actions"><button aria-label="重置" onClick={resetTimer}><TimerReset size={17}/></button><button onClick={() => setRunning(value => !value)}>{running ? <><TimerReset size={17}/>暂停</> : <><Play size={17} fill="currentColor"/>开始{modes[mode].label}</>}</button></div></section><section className="fb-progress"><div className="fb-card-head"><div><p className="fb-eyebrow">TODAY'S RHYTHM</p><h2>完成进度</h2></div><b>{progress}%</b></div><div className="fb-bar"><i style={{ width: `${progress}%` }}></i></div><p><span><b>{done}</b> / {tasks.length} 件已完成</span><i></i><span>{progress >= 70 ? '今天状态很好' : '从一件小事开始'}</span></p></section></aside>
    </section>

    <section className="fb-review" id="review"><div className="fb-heading"><div><p className="fb-eyebrow">A LITTLE REVIEW</p><h2>本周足迹</h2></div><button onClick={exportData}><Download size={15}/>导出数据</button></div><div className="fb-week"><div><h3>你已找回 <em>{recovered}</em><br/>属于自己的深度时间。</h3><p>每一点专注都在积累。所有数据只保存在你的设备里。</p></div><div className="fb-chart" aria-label="本周专注趋势">{weeklyBars.map((height, index) => <span className={index === 5 ? 'selected' : ''} key={index}><i style={{ height: `${height}%` }}></i><small>{['一', '二', '三', '四', '五', '六', '日'][index]}</small></span>)}</div></div></section>

    {dialog === 'task' && <Dialog onClose={() => setDialog(null)}><form onSubmit={saveTask}><p className="fb-eyebrow">ADD TO TODAY</p><h2>留住一个念头</h2><label>任务名称<input autoFocus value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="我想完成…"/></label><div className="fb-form-grid"><label>类别<select value={draft.tag} onChange={event => setDraft({ ...draft, tag: event.target.value })}>{Object.keys(categories).map(item => <option key={item}>{item}</option>)}</select></label><label>优先级<select value={draft.priority} onChange={event => setDraft({ ...draft, priority: event.target.value })}><option>高</option><option>中</option><option>低</option></select></label></div><label>计划时间<input value={draft.time} onChange={event => setDraft({ ...draft, time: event.target.value })} placeholder="例如：14:30"/></label><button className="fb-submit">加入今日清单 <ArrowUpRight size={17}/></button></form></Dialog>}
    {dialog === 'intention' && <Dialog onClose={() => setDialog(null)}><form onSubmit={event => { event.preventDefault(); setDialog(null); notify('今天的方向已保存') }}><p className="fb-eyebrow">DAILY INTENTION</p><h2>为今天定个方向</h2><label>一句就够了<input autoFocus maxLength="48" value={intention} onChange={event => setIntention(event.target.value)} placeholder="例如：先完成体验走查，再处理消息。"/></label><button className="fb-submit">保存方向 <Check size={17}/></button></form></Dialog>}
    {dialog === 'settings' && <Dialog onClose={() => setDialog(null)}><p className="fb-eyebrow">YOUR SPACE</p><h2>偏好设置</h2><button className="fb-setting" onClick={() => setDark(value => !value)}><span>{dark ? <Moon size={18}/> : <Sun size={18}/>} {dark ? '深色外观' : '浅色外观'}</span><b>{dark ? '已启用' : '切换'}</b></button><button className="fb-setting" onClick={exportData}><span><Download size={18}/>导出我的数据</span><b>JSON</b></button><button className="fb-setting danger" onClick={resetDemo}><span><RotateCcw size={18}/>恢复示例数据</span><b>重置</b></button></Dialog>}
    {toast && <div className="fb-toast"><Check size={16}/>{toast}</div>}
  </main>
}

function Dialog({ children, onClose }) { return <div className="fb-backdrop" onMouseDown={onClose}><section className="fb-dialog" onMouseDown={event => event.stopPropagation()}><button className="fb-close" onClick={onClose} aria-label="关闭"><X size={18}/></button>{children}</section></div> }
createRoot(document.getElementById('root')).render(<App />)
