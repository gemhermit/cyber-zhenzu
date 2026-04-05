import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

function getDaysUntil(dateStr: string): number {
  const [month, day] = dateStr.split('-').map(Number);
  const now = new Date();
  const thisYear = now.getFullYear();
  let target = new Date(thisYear, month - 1, day);
  if (target < now) {
    target = new Date(thisYear + 1, month - 1, day);
  }
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MemorialDaysView() {
  const { memorialDays, ancestors, addMemorialDay, removeMemorialDay, toggleReminder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ancestorId: '',
    date: '',
    label: '忌日',
  });

  const enriched = useMemo(() => {
    return memorialDays.map((m) => {
      const ancestor = ancestors.find((a) => a.id === m.ancestorId);
      const days = getDaysUntil(m.date);
      const [month, day] = m.date.split('-');
      const label = ancestor
        ? ancestor.name + (m.label ? ` ${m.label}` : '')
        : m.label;
      return { ...m, ancestor, days, month: parseInt(month), day: parseInt(day), label };
    }).sort((a, b) => a.days - b.days);
  }, [memorialDays, ancestors]);

  const handleAdd = () => {
    if (!form.ancestorId || !form.date) return;
    addMemorialDay({ ancestorId: form.ancestorId, date: form.date, label: form.label });
    setForm({ ancestorId: '', date: '', label: '忌日' });
    setShowForm(false);
  };

  return (
    <div className="relative flex flex-col items-center px-4">
      <div className="text-center mb-8">
        <h1 className="font-zhu text-4xl text-c-gold text-glow-gold mb-2">祭祀日期</h1>
        <p className="text-c-muted text-xs font-mono">MEMORIAL DAYS & REMINDERS</p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Upcoming */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-c-red" style={{ boxShadow: '0 0 8px #e63946' }} />
            <span className="font-zhu text-sm text-c-text">即将到来</span>
          </div>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {enriched.map((item) => {
                const isUrgent = item.days <= 7;
                const isToday = item.days === 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative rounded-lg p-4 flex items-center gap-4"
                    style={{
                      background: isToday
                        ? 'rgba(230,57,70,0.15)'
                        : isUrgent
                        ? 'rgba(230,57,70,0.08)'
                        : 'rgba(17,17,24,0.6)',
                      border: `1px solid ${isToday ? 'rgba(230,57,70,0.5)' : isUrgent ? 'rgba(230,57,70,0.3)' : '#2a2a35'}`,
                      boxShadow: isToday ? '0 0 20px rgba(230,57,70,0.15)' : 'none',
                    }}
                  >
                    {/* Countdown circle */}
                    <div
                      className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0"
                      style={{
                        background: isToday
                          ? 'rgba(230,57,70,0.2)'
                          : 'rgba(26,26,37,0.8)',
                        border: `1px solid ${isToday ? '#e63946' : '#2a2a35'}`,
                        boxShadow: isToday ? '0 0 15px rgba(230,57,70,0.3)' : 'none',
                      }}
                    >
                      <span
                        className="font-mono font-bold"
                        style={{ fontSize: '18px', color: isToday ? '#e63946' : '#f4a825' }}
                      >
                        {isToday ? '今' : item.days}
                      </span>
                      {!isToday && (
                        <span className="text-[8px] font-mono text-c-muted">天</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="font-zhu text-c-text text-sm mb-1">{item.label}</div>
                      <div className="text-c-muted text-xs font-mono">
                        {item.month}月{item.day}日
                        {isToday && (
                          <span
                            className="ml-2 px-2 py-0.5 rounded text-[9px]"
                            style={{ background: 'rgba(230,57,70,0.2)', color: '#e63946' }}
                          >
                            今日
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reminder */}
                    <button
                      onClick={() => toggleReminder(item.id)}
                      className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-all"
                      style={{
                        background: item.reminded ? 'rgba(0,229,255,0.15)' : 'transparent',
                        border: `1px solid ${item.reminded ? 'rgba(0,229,255,0.4)' : '#2a2a35'}`,
                        color: item.reminded ? '#00e5ff' : '#7a7570',
                      }}
                    >
                      {item.reminded ? '🔔 已提醒' : '提醒'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => removeMemorialDay(item.id)}
                      className="text-c-muted hover:text-c-red transition-colors cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {enriched.length === 0 && (
          <div className="text-center py-12 text-c-muted">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-xs font-mono">暂无祭日记录</div>
          </div>
        )}

        {/* Add form */}
        <AnimatePresence>
          {!showForm ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-lg font-zhu text-sm transition-all cursor-pointer"
              style={{
                background: 'rgba(17,17,24,0.8)',
                border: '1px solid rgba(244,168,37,0.4)',
                color: '#f4a825',
              }}
            >
              + 添加祭日
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-lg p-5"
              style={{
                background: 'rgba(17,17,24,0.9)',
                border: '1px solid #2a2a35',
              }}
            >
              <div className="flex flex-col gap-3">
                <select
                  value={form.ancestorId}
                  onChange={(e) => setForm({ ...form, ancestorId: e.target.value })}
                  className="px-4 py-2 rounded text-sm"
                  style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3' }}
                >
                  <option value="">选择祖先</option>
                  {ancestors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    setForm({ ...form, date: `${mm}-${dd}` });
                  }}
                  className="px-4 py-2 rounded text-sm"
                  style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3' }}
                />
                <div className="flex gap-2">
                  {['忌日', '生日', '清明', '中元'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm({ ...form, label: l })}
                      className="flex-1 py-1.5 rounded text-xs font-zhu cursor-pointer transition-all"
                      style={{
                        background: form.label === l ? 'rgba(244,168,37,0.15)' : 'transparent',
                        border: `1px solid ${form.label === l ? 'rgba(244,168,37,0.5)' : '#2a2a35'}`,
                        color: form.label === l ? '#f4a825' : '#7a7570',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer"
                    style={{ background: 'rgba(244,168,37,0.2)', border: '1px solid rgba(244,168,37,0.4)', color: '#f4a825' }}>
                    确认
                  </button>
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer"
                    style={{ background: 'transparent', border: '1px solid #2a2a35', color: '#7a7570' }}>
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
