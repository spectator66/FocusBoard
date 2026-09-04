import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Circle,
  Clock3, Coffee, Flame, GripVertical, Menu, MoreHorizontal, Play,
  Plus, Settings2, Sparkles, Target, TimerReset, X
} from 'lucide-react'
import './styles.css'

const initialTasks = [
  { id: 1, title: '完成产品体验走查', tag: '产品', color: 'orange', done: false, time: '09:30' },
  { id: 2, title: '整理本周用户访谈洞察', tag: '研究', color: 'violet', done: false, time: '11:00' },
  { id: 3, title: '写项目周报', tag: '写作', color: 'blue', done: false, time: '15:00' },
  { id: 4, title: '回复关键协作消息', tag: '沟通', color: 'green', done: true, time: '16:30' },
]

const quotes = ['先做最重要的那一件。', '把注意力留给真正重要的事。', '今天也值得被认真度过。']

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('focus-tasks')) || initialTasks)
  const [focus, setFocus] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [tab, setTab] = useState('今天')
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem('focus-tasks', JSON.stringify(tasks)), [tasks])
  useEffect(() => {
    if (!running) return
    const ticker = setInterval(() => setFocus(v => v > 0 ? v - 1 : 25 * 60), 1000)
    return () => clearInterval(ticker)
  }, [running])

  const completed = tasks.filter(t => t.done).length
  const progress = Math.round((completed / tasks.length) * 100)
  const time = `${String(Math.floor(focus / 60)).padStart(2, '0')}:${String(focus % 60).padStart(2, '0')}`
  const addTask = (event) => {
    event.preventDefault()
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now(), title: newTask.trim(), tag: '待安排', color: 'blue', done: false, time: '稍后' }])
    setNewTask(''); setShowAdd(false); setToast('新任务已加入今天的清单')
    setTimeout(() => setToast(''), 2400)
  }
  const toggleTask = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark"><Sparkles size={17}/></span><span>focusboard</span></a>
      <nav>{['今天', '专注', '复盘'].map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <div className="top-actions"><button className="icon-button"><Settings2 size={18}/></button><div className="avatar">林</div></div>
    </header>

    <section className="hero" id="top">
      <div className="date-row"><span>2026 / 09 / 04</span><span className="sun-dot"></span><span>星期五</span></div>
      <div className="hero-grid">
        <div><p className="eyebrow">GOOD MORNING, LIN</p><h1>让今天，<em>清晰发生。</em></h1><p className="subtitle">{quotes[new Date().getDate() % quotes.length]}<br/>你的节奏，由你决定。</p></div>
        <div className="hero-side"><div className="streak"><span className="streak-flame"><Flame size={21}/></span><div><b>12 天</b><small>连续专注</small></div></div><button className="new-task" onClick={() => setShowAdd(true)}><Plus size={17}/> 新建任务</button></div>
      </div>
    </section>

    <section className="content-grid">
      <div className="main-column">
        <div className="section-heading"><div><p className="eyebrow">TODAY'S AGENDA</p><h2>今日清单 <span>{tasks.length}</span></h2></div><button className="text-button">查看日历 <ArrowUpRight size={15}/></button></div>
        <div className="agenda-card">
          {tasks.map((task, index) => <article className={`task ${task.done ? 'is-done' : ''}`} key={task.id}>
            <button className="check" aria-label="切换任务完成状态" onClick={() => toggleTask(task.id)}>{task.done ? <Check size={14}/> : null}</button>
            <div className="task-details"><div className="task-title">{task.title}</div><span className={`tag ${task.color}`}>{task.tag}</span></div>
            <div className="task-time"><Clock3 size={14}/>{task.time}</div><button className="task-more"><MoreHorizontal size={18}/></button>
            {index === 0 && <div className="now-badge">现在</div>}
          </article>)}
          <button className="add-line" onClick={() => setShowAdd(true)}><Plus size={17}/> 添加一件想完成的事</button>
        </div>
        <div className="intention"><div className="intention-icon"><Target size={21}/></div><div><p className="eyebrow">DAILY INTENTION</p><h3>今天的重点是什么？</h3><p>为今天写下一句方向，它会在忙碌时提醒你。</p></div><button>写下它 <ArrowUpRight size={15}/></button></div>
      </div>

      <aside className="side-column">
        <section className="focus-card"><div className="card-top"><div><p className="eyebrow">FOCUS SESSION</p><h2>专注时刻</h2></div><button className="icon-button pale"><MoreHorizontal size={18}/></button></div>
          <div className="timer-wrap"><svg viewBox="0 0 160 160" className="timer-ring"><circle cx="80" cy="80" r="68"/><circle className="progress-ring" cx="80" cy="80" r="68" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - (focus / 1500 * 100)}/></svg><div className="timer-value"><b>{time}</b><span>专注</span></div></div>
          <p className="focus-task"><span></span>产品体验走查</p><div className="focus-actions"><button className="reset" onClick={() => setFocus(25 * 60)}><TimerReset size={17}/></button><button className="play" onClick={() => setRunning(!running)}>{running ? <><TimerReset size={17}/> 暂停</> : <><Play size={17} fill="currentColor"/> 开始专注</>}</button></div>
        </section>
        <section className="progress-card"><div className="card-top"><div><p className="eyebrow">TODAY'S RHYTHM</p><h2>完成进度</h2></div><b className="progress-number">{progress}%</b></div><div className="bar"><i style={{width: `${progress}%`}}></i></div><div className="progress-foot"><span><b>{completed}</b> / {tasks.length} 件已完成</span><span className="soft-dot"></span><span>很好，继续保持</span></div></section>
      </aside>
    </section>

    <section className="bottom-section"><div className="section-heading"><div><p className="eyebrow">A LITTLE REVIEW</p><h2>本周足迹</h2></div><button className="text-button">查看详情 <ArrowUpRight size={15}/></button></div><div className="week-card"><div className="week-copy"><h3>你已找回 <em>6 小时 40 分</em><br/>属于自己的深度时间。</h3><p>比上周多了 18%，每一点专注都在积累。</p></div><div className="chart">{[34, 48, 39, 66, 51, 85, 61].map((height, i) => <div className={i === 5 ? 'bar-item selected' : 'bar-item'} key={i}><i style={{height: `${height}%`}}></i><small>{['一','二','三','四','五','六','日'][i]}</small></div>)}</div></div></section>

    {showAdd && <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}><form className="task-modal" onSubmit={addTask} onMouseDown={e => e.stopPropagation()}><button type="button" className="close" onClick={() => setShowAdd(false)}><X size={18}/></button><p className="eyebrow">ADD TO TODAY</p><h2>留住一个念头</h2><input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="我想完成…"/><button className="submit" type="submit">加入今日清单 <ArrowUpRight size={17}/></button></form></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
