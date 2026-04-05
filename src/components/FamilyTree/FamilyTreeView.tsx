import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import type { Ancestor } from '@/types';

const GEN_LABELS = {
  zǔ: { zh: '祖', color: '#e63946', desc: '祖辈（曾祖父及以上）' },
  kǎo: { zh: '考', color: '#f4a825', desc: '父辈男性（祖父/父亲）' },
  bǐ: { zh: '妣', color: '#00e5ff', desc: '父辈女性（祖母/母亲）' },
};

const GEN_ORDER = { zǔ: 0, kǎo: 1, bǐ: 2 };

// 常见姓氏列表（用于识别名字前缀）
const COMMON_SURNAMES = [
  '李','王','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱',
  '高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于',
  '董','萧','程','曹','袁','邓','彭','钱','蒋','蔡','潘','田','杜','叶',
  '余','苏','卢','姜','崔','钟','谭','陆','汪','范','金','韦','夏','方',
  '石','姚','雷','毛','侯','邵','孟','龙','万','段','漕','钱','颜','丁',
];

const TITLE_PREFIXES = ['曾祖父','曾祖母','祖父','祖母','父亲','母亲','父','母'];

// 从姓名中提取姓氏（取前1-2个字符）
function extractSurname(fullName: string): string {
  let name = fullName.trim();
  // 去掉头衔前缀
  for (const t of TITLE_PREFIXES) {
    if (name.startsWith(t)) {
      name = name.slice(t.length);
      break;
    }
  }
  name = name.trim();
  if (!name) return '';
  // 检查前2个字符是否在常见姓氏表里（复姓）
  const first2 = name.slice(0, 2);
  if (COMMON_SURNAMES.includes(first2)) return first2;
  // 否则取第一个字符
  return name[0] || '';
}

// 归一化代数
function normalizeGen(raw: string): Ancestor['generation'] {
  const s = raw.trim();
  if (['祖','zǔ','zhu','zu','Z'].includes(s)) return 'zǔ';
  if (['妣','bǐ','bi','B','母','祖母'].includes(s)) return 'bǐ';
  return 'kǎo';
}

// 归一化姓名（去掉前缀）
function normalizeName(name: string): string {
  let n = name.trim();
  for (const t of TITLE_PREFIXES) {
    if (n.startsWith(t)) {
      n = n.slice(t.length).trim();
      break;
    }
  }
  return n;
}

// 从已有祖先中推断姓氏（取众数）
function inferSurname(ancestors: Ancestor[]): string {
  if (ancestors.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const a of ancestors) {
    const s = extractSurname(a.name);
    if (s) counts[s] = (counts[s] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

// CSV 解析：支持 "姓名,生年,卒年,代数,关系,简介"
function parseCSV(text: string): Partial<Ancestor>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const results: Partial<Ancestor>[] = [];
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts[0]) {
      results.push({
        name: normalizeName(parts[0]),
        birthYear: parts[1] ? parseInt(parts[1]) : undefined,
        deathYear: parts[2] ? parseInt(parts[2]) : undefined,
        generation: parts[3] ? normalizeGen(parts[3]) : 'kǎo',
        relationship: parts[4] || undefined,
        bio: parts[5] || undefined,
      });
    }
  }
  return results;
}

// JSON 解析
function parseJSON(text: string): Partial<Ancestor>[] {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.ancestors || data.members || [];
    return arr.map((item: any) => ({
      name: normalizeName(item.name || item.姓名 || ''),
      birthYear: item.birthYear || item.生年 ? parseInt(item.birthYear || item.生年) : undefined,
      deathYear: item.deathYear || item.卒年 ? parseInt(item.deathYear || item.卒年) : undefined,
      generation: normalizeGen(item.generation || item.代数 || item.type || 'kǎo'),
      relationship: item.relationship || item.关系 || undefined,
      bio: item.bio || item.简介 || undefined,
    })).filter((a: any) => a.name);
  } catch {
    return [];
  }
}

// 导入预览行
interface ImportPreview {
  name: string;
  birthYear?: number;
  deathYear?: number;
  generation: Ancestor['generation'];
  relationship?: string;
  bio?: string;
  valid: boolean;
  error?: string;
}

export default function FamilyTreeView() {
  const { ancestors, addAncestor, removeAncestor, setActiveAncestor, activeAncestorId, setActiveSection } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState<'json' | 'csv'>('csv');
  const [preview, setPreview] = useState<ImportPreview[]>([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    generation: 'kǎo' as Ancestor['generation'],
    birthYear: '',
    deathYear: '',
    relationship: '',
    bio: '',
  });

  const surname = useMemo(() => inferSurname(ancestors), [ancestors]);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addAncestor({
      id: `anc-${Date.now()}`,
      name: form.name.startsWith(surname) ? form.name : surname + form.name.trim(),
      generation: form.generation,
      birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
      deathYear: form.deathYear ? parseInt(form.deathYear) : undefined,
      relationship: form.relationship || undefined,
      bio: form.bio || undefined,
    });
    setForm({ name: '', generation: 'kǎo', birthYear: '', deathYear: '', relationship: '', bio: '' });
    setShowAddForm(false);
  };

  const handlePreview = () => {
    if (!importText.trim()) return;
    setImportError('');
    try {
      const raw = importType === 'csv' ? parseCSV(importText) : parseJSON(importText);
      if (raw.length === 0) {
        setImportError('未能解析到任何数据，请检查格式');
        return;
      }
      setPreview(raw.map(item => ({
        ...item,
        generation: item.generation || 'kǎo',
        valid: !!item.name,
        error: item.name ? undefined : '姓名为空',
      } as ImportPreview)));
    } catch (e: any) {
      setImportError(`解析失败: ${e.message}`);
    }
  };

  const handleImport = () => {
    const validItems = preview.filter(p => p.valid);
    if (validItems.length === 0) return;
    validItems.forEach((item, i) => {
      addAncestor({
        id: `anc-import-${Date.now()}-${i}`,
        name: item.name.startsWith(surname) ? item.name : (surname + item.name),
        generation: item.generation,
        birthYear: item.birthYear,
        deathYear: item.deathYear,
        relationship: item.relationship,
        bio: item.bio,
      });
    });
    setImportText('');
    setPreview([]);
    setShowImport(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportText(ev.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = ancestors.map(a => ({
      姓名: a.name,
      生年: a.birthYear,
      卒年: a.deathYear,
      代数: a.generation,
      关系: a.relationship,
      简介: a.bio,
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${surname || '家谱'}_family_tree.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sort by generation
  const sorted = [...ancestors].sort((a, b) => GEN_ORDER[a.generation] - GEN_ORDER[b.generation]);

  // Surname display
  const displaySurname = surname || '待定';

  return (
    <div className="relative flex flex-col items-center px-3 sm:px-4 py-4" data-page-capture>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-1">
          {/* Surname badge */}
          <div
            className="px-4 py-1 rounded-full text-xl font-zhu"
            style={{
              background: 'rgba(244,168,37,0.15)',
              border: '1px solid rgba(244,168,37,0.4)',
              color: '#f4a825',
              textShadow: '0 0 12px rgba(244,168,37,0.6)',
              letterSpacing: '0.2em',
              fontSize: '24px',
            }}
          >
            {displaySurname}氏
          </div>
        </div>
        <h1 className="font-zhu text-2xl text-c-gold text-glow-gold mb-1" style={{ letterSpacing: '0.1em' }}>
          宗谱录
        </h1>
        <p className="text-c-muted text-xs font-mono">
          共 {ancestors.length} 位先祖 · 姓氏由姓名自动识别
        </p>
      </div>

      {/* Generation legend */}
      <div className="flex gap-5 mb-5">
        {(['zǔ', 'kǎo', 'bǐ'] as const).map((g) => (
          <div key={g} className="flex items-center gap-1.5 group relative">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: GEN_LABELS[g].color, boxShadow: `0 0 6px ${GEN_LABELS[g].color}` }}
            />
            <span className="font-zhu text-c-muted text-xs">{GEN_LABELS[g].zh}</span>
            <span className="text-[9px] text-c-muted font-mono opacity-0 group-hover:opacity-60 transition-opacity">
              {GEN_LABELS[g].desc}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5 flex-wrap justify-center">
        <button
          onClick={handleExport}
          disabled={ancestors.length === 0}
          className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-all disabled:opacity-30"
          style={{
            background: 'rgba(26,26,37,0.8)',
            border: '1px solid #2a2a35',
            color: '#7a7570',
          }}
        >
          导出JSON
        </button>
        <button
          onClick={() => { setShowImport(true); setShowAddForm(false); setImportText(''); setPreview([]); setImportError(''); }}
          className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-all"
          style={{
            background: 'rgba(0,229,255,0.08)',
            border: '1px solid rgba(0,229,255,0.3)',
            color: '#00e5ff',
          }}
        >
          批量导入
        </button>
        <button
          onClick={() => { setShowAddForm(true); setShowImport(false); }}
          className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-all"
          style={{
            background: 'rgba(230,57,70,0.08)',
            border: '1px solid rgba(230,57,70,0.3)',
            color: '#e63946',
          }}
        >
          + 添加先祖
        </button>
      </div>

      {/* Import panel */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl rounded-lg p-5 mb-5"
            style={{
              background: 'rgba(17,17,24,0.9)',
              border: '1px solid rgba(0,229,255,0.2)',
              boxShadow: '0 0 30px rgba(0,229,255,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-zhu text-c-text text-sm">批量导入先祖</h3>
              <button onClick={() => setShowImport(false)} className="text-c-muted hover:text-c-red cursor-pointer text-xs">× 关闭</button>
            </div>

            {/* Type tabs */}
            <div className="flex gap-2 mb-3">
              {(['csv', 'json'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setImportType(t); setPreview([]); }}
                  className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-all"
                  style={{
                    background: importType === t ? 'rgba(0,229,255,0.15)' : 'transparent',
                    border: `1px solid ${importType === t ? 'rgba(0,229,255,0.4)' : '#2a2a35'}`,
                    color: importType === t ? '#00e5ff' : '#7a7570',
                  }}
                >
                  {t === 'csv' ? 'CSV 文本' : 'JSON'}
                </button>
              ))}
            </div>

            {/* Format hint */}
            <div
              className="text-[10px] font-mono mb-3 px-3 py-2 rounded"
              style={{ background: 'rgba(26,26,37,0.6)', border: '1px solid #2a2a35', color: '#7a7570' }}
            >
              {importType === 'csv' ? (
                <span>格式：<span className="text-c-gold">姓名,生年,卒年,代数(祖/考/妣),关系,简介</span><br />每行一条，如：{displaySurname}德福,1921,1998,祖,曾祖父,勤俭持家</span>
              ) : (
                <span>JSON 数组：<span className="text-c-gold">{`[{"姓名":"...","生年":1921,"卒年":1998,"代数":"祖"}]`}</span></span>
              )}
            </div>

            {/* File upload */}
            <div className="flex gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer"
                style={{ background: 'rgba(26,26,37,0.6)', border: '1px solid #2a2a35', color: '#7a7570' }}
              >
                📁 上传文件
              </button>
              <span className="text-[10px] text-c-muted font-mono self-center">
                {importText ? `已加载 ${importText.split('\n').filter(l=>l.trim()).length} 行` : '支持 .csv / .json / .txt'}
              </span>
            </div>

            <textarea
              value={importText}
              onChange={(e) => { setImportText(e.target.value); setPreview([]); }}
              placeholder={importType === 'csv'
                ? `姓名,生年,卒年,代数,关系,简介\n${displaySurname}德福,1921,1998,祖,曾祖父,勤俭持家\n${displaySurname}建国,1948,2019,考,祖父,技艺精湛`
                : `[\n  {"姓名":"${displaySurname}德福","生年":1921,"卒年":1998,"代数":"祖"},\n  {"姓名":"${displaySurname}建国","生年":1948,"卒年":2019,"代数":"考"}\n]`
              }
              rows={8}
              className="w-full rounded p-3 text-xs font-mono resize-none mb-3"
              style={{ background: '#0d0d12', border: '1px solid #2a2a35', color: '#f0ece3' }}
            />

            {importError && (
              <div className="text-xs font-mono text-c-red mb-3 px-3 py-2 rounded" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                {importError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={!importText.trim()}
                className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer disabled:opacity-30"
                style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff' }}
              >
                预览
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer"
                style={{ background: 'transparent', border: '1px solid #2a2a35', color: '#7a7570' }}
              >
                取消
              </button>
            </div>

            {/* Preview table */}
            {preview.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-c-muted">预览（{preview.filter(p=>p.valid).length} 条有效）</span>
                  <button
                    onClick={handleImport}
                    disabled={preview.filter(p=>p.valid).length === 0}
                    className="px-3 py-1 rounded text-xs font-zhu cursor-pointer disabled:opacity-30"
                    style={{ background: 'rgba(244,168,37,0.15)', border: '1px solid rgba(244,168,37,0.4)', color: '#f4a825' }}
                  >
                    确认导入
                  </button>
                </div>
                <div className="overflow-x-auto rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(26,26,37,0.6)', borderBottom: '1px solid #2a2a35' }}>
                        <th className="px-2 py-1 text-left font-mono text-c-muted">姓名</th>
                        <th className="px-2 py-1 text-left font-mono text-c-muted">生年</th>
                        <th className="px-2 py-1 text-left font-mono text-c-muted">卒年</th>
                        <th className="px-2 py-1 text-left font-mono text-c-muted">代数</th>
                        <th className="px-2 py-1 text-left font-mono text-c-muted">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,26,37,0.2)', borderBottom: '1px solid #1a1a25' }}>
                          <td className="px-2 py-1 font-zhu" style={{ color: p.valid ? '#f0ece3' : '#e63946' }}>
                            {surname}{p.name}
                          </td>
                          <td className="px-2 py-1 font-mono text-c-muted">{p.birthYear || '—'}</td>
                          <td className="px-2 py-1 font-mono text-c-muted">{p.deathYear || '—'}</td>
                          <td className="px-2 py-1 font-zhu" style={{ color: GEN_LABELS[p.generation].color }}>
                            {GEN_LABELS[p.generation].zh}
                          </td>
                          <td className="px-2 py-1 font-mono text-[10px]">
                            {p.valid ? (
                              <span style={{ color: '#7cb342' }}>✓</span>
                            ) : (
                              <span style={{ color: '#e63946' }}>✗ {p.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-lg p-5 w-full max-w-md mb-5"
            style={{
              background: 'rgba(17,17,24,0.9)',
              border: '1px solid #2a2a35',
            }}
          >
            <h3 className="font-zhu text-c-text text-sm mb-4 text-center">添加先祖</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                {/* Surname prefix badge */}
                <div
                  className="px-3 py-2 rounded text-sm font-zhu flex-shrink-0"
                  style={{
                    background: 'rgba(244,168,37,0.15)',
                    border: '1px solid rgba(244,168,37,0.3)',
                    color: '#f4a825',
                  }}
                >
                  {surname || '?'}×
                </div>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="名字（不加姓，自动拼接）"
                  className="flex-1 px-4 py-2 rounded text-sm"
                  style={{
                    background: '#1a1a25',
                    border: '1px solid #2a2a35',
                    color: '#f0ece3',
                    fontFamily: 'ZCOOL XiaoWei, serif',
                  }}
                />
              </div>
              <div className="text-[9px] text-c-muted font-mono px-1">
                完整姓名：{surname || '?'}{form.name || '____'}
              </div>
              <div className="flex gap-2">
                {(['zǔ', 'kǎo', 'bǐ'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, generation: g })}
                    className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer transition-all"
                    style={{
                      background: form.generation === g ? `${GEN_LABELS[g].color}20` : 'transparent',
                      border: `1px solid ${form.generation === g ? GEN_LABELS[g].color : '#2a2a35'}`,
                      color: form.generation === g ? GEN_LABELS[g].color : '#7a7570',
                    }}
                  >
                    {GEN_LABELS[g].zh} · {GEN_LABELS[g].desc.split('（')[0]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={form.birthYear}
                  onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                  placeholder="生年"
                  className="flex-1 px-4 py-2 rounded text-xs"
                  style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3' }}
                />
                <input
                  value={form.deathYear}
                  onChange={(e) => setForm({ ...form, deathYear: e.target.value })}
                  placeholder="卒年"
                  className="flex-1 px-4 py-2 rounded text-xs"
                  style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3' }}
                />
              </div>
              <input
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="关系（如：祖父、曾祖母）"
                className="px-4 py-2 rounded text-xs"
                style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3', fontFamily: 'ZCOOL XiaoWei, serif' }}
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="生平简介（可选）"
                rows={2}
                className="px-4 py-2 rounded text-xs resize-none"
                style={{ background: '#1a1a25', border: '1px solid #2a2a35', color: '#f0ece3', fontFamily: 'ZCOOL XiaoWei, serif' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!form.name.trim()}
                  className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer disabled:opacity-30"
                  style={{ background: 'rgba(244,168,37,0.2)', border: '1px solid rgba(244,168,37,0.4)', color: '#f4a825' }}
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded text-xs font-zhu cursor-pointer"
                  style={{ background: 'transparent', border: '1px solid #2a2a35', color: '#7a7570' }}
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Family tree visualization */}
      {ancestors.length === 0 && !showAddForm && !showImport ? (
        <div className="flex flex-col items-center justify-center py-20 text-c-muted">
          <span className="text-5xl mb-4">🌳</span>
          <p className="font-zhu text-sm mb-1">族谱尚空</p>
          <p className="text-xs font-mono">添加先祖或批量导入数据</p>
        </div>
      ) : ancestors.length > 0 ? (
        <div
          className="w-full max-w-4xl rounded-lg overflow-hidden"
          style={{
            background: 'rgba(17,17,24,0.4)',
            border: '1px solid #2a2a35',
          }}
        >
          {/* Generation groups */}
          {(['zǔ', 'kǎo', 'bǐ'] as const).map((gen) => {
            const group = sorted.filter(a => a.generation === gen);
            if (group.length === 0) return null;
            return (
              <div key={gen} className="border-b border-c-border last:border-b-0">
                {/* Gen header */}
                <div
                  className="flex items-center gap-2 px-6 py-2"
                  style={{ background: 'rgba(26,26,37,0.4)', borderBottom: '1px solid #1a1a25' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: GEN_LABELS[gen].color, boxShadow: `0 0 8px ${GEN_LABELS[gen].color}` }}
                  />
                  <span className="font-zhu text-xs" style={{ color: GEN_LABELS[gen].color }}>
                    {displaySurname}氏{GEN_LABELS[gen].desc}
                  </span>
                  <span className="text-[9px] font-mono text-c-muted ml-auto">{group.length}人</span>
                </div>

                {/* Ancestor cards */}
                <div className="flex flex-wrap gap-4 p-5 justify-center">
                  <AnimatePresence>
                    {group.map((anc) => {
                      const isActive = anc.id === activeAncestorId;
                      const nameWithoutTitle = anc.name.replace(
                        /^(曾祖父|曾祖母|祖父|祖母|父亲|母亲|父|母)/, ''
                      );
                      return (
                        <motion.div
                          key={anc.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1.05 }}
                          className="relative flex flex-col items-center cursor-pointer group"
                          onClick={() => { setActiveAncestor(anc.id); setActiveSection('altar'); }}
                        >
                          {/* Avatar */}
                          <div
                            className="w-14 h-14 rounded-full overflow-hidden relative mb-2"
                            style={{
                              border: `2px solid ${isActive ? GEN_LABELS[gen].color : 'rgba(42,42,53,0.8)'}`,
                              boxShadow: isActive
                                ? `0 0 20px ${GEN_LABELS[gen].color}60`
                                : '0 0 10px rgba(0,0,0,0.4)',
                              background: '#1a1a25',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {anc.photoUrl ? (
                              <img src={anc.photoUrl} alt={anc.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                👤
                              </div>
                            )}
                            {isActive && (
                              <div
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono"
                                style={{ background: GEN_LABELS[gen].color, color: '#0a0a0f' }}
                              >
                                在祀
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="text-center">
                            <div className="font-zhu text-xs" style={{ color: isActive ? GEN_LABELS[gen].color : '#f0ece3' }}>
                              {nameWithoutTitle}
                            </div>
                            {(anc.birthYear || anc.deathYear) && (
                              <div className="text-[9px] font-mono text-c-muted">
                                {anc.birthYear || '?'}–{anc.deathYear || '?'}
                              </div>
                            )}
                            {anc.bio && (
                              <div className="text-[8px] text-c-muted font-zhu mt-0.5 max-w-[80px] truncate">
                                {anc.bio}
                              </div>
                            )}
                          </div>

                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeAncestor(anc.id); }}
                            className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-[8px] font-mono"
                            style={{ background: '#e63946', color: '#fff' }}
                          >
                            删除
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
