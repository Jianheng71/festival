"use client';
import { useEffect, useState, useRef } from 'react';
import { supabase, type Festival } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import { Lock, Upload, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Festival>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  useEffect(() => { if (authed) fetchFestivals(); }, [authed]);
  async function fetchFestivals() {
    setLoading(true);
    const { data } = await supabase.from('festivals').select('*').order('date', { ascending: true });
    setFestivals(data || []); setLoading(false);
  }
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (res.ok) { setAuthed(true); } else { setError('密码错误'); }
    } catch { setError('网络错误'); }
  }
  function startEdit(f: Festival) { setEditingId(f.id); setEditValues({ name: f.name, tag: f.tag, copy: f.copy }); }
  async function saveEdit(id: string) {
    await supabase.from('festivals').update({ name: editValues.name, tag: editValues.tag, copy: editValues.copy }).eq('id', id);
    setFestivals((prev) => prev.map((f) => f.id === id ? { ...f, name: editValues.name || f.name, tag: editValues.tag || '', copy: editValues.copy || '' } : f));
    setEditingId(null);
  }
  async function handleImageUpload(file: File, festivalId: string) {
    setUploadingId(festivalId);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1920, useWebWorker: true });
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${festivalId}_${Date.now()}.${ext}`;
      await supabase.storage.from('festival-images').upload(fileName, compressed, { contentType: compressed.type, upsert: true });
      const { data: urlData } = supabase.storage.from('festival-images').getPublicUrl(fileName);
      await supabase.from('festivals').update({ image_url: urlData.publicUrl }).eq('id', festivalId);
      setFestivals((prev) => prev.map((f) => f.id === festivalId ? { ...f, image_url: urlData.publicUrl } : f));
    } catch { alert('上传失败'); } finally { setUploadingId(null); setUploadTargetId(null); }
  }
  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (file && uploadTargetId) handleImageUpload(file, uploadTargetId); e.target.value = '';
  }
  if (!authed) {
    return (
      <main className="min-h-screen paper-texture flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-foreground/5 mb-4"><Lock className="w-6 h-6 text-muted-foreground" /></div><h1 className="font-serif text-2xl font-bold mb-1">后台管理</h1><p className="text-sm text-muted-foreground">请输入密码访问</p></div>
          <form onSubmit={handleLogin} className="space-y-4"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-ring/20" autoFocus />{error && <p className="text-sm text-destructive text-center">{error}</p>}<button type="submit" className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-80">进入</button></form>
          <div className="mt-6 text-center"><a href="/" className="text-sm text-muted-foreground hover:text-foreground">← 返回首页</a></div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen paper-texture px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8"><div className="flex items-center gap-3"><a href="/" className="p-2 rounded-full hover:bg-foreground/5"><ArrowLeft className="w-5 h-5" /></a><h1 className="font-serif text-xl font-bold">节日管理</h1></div><span className="text-sm text-muted-foreground">{festivals.length} 个节日</span></header>
        {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div> : (
          <div className="space-y-3">{festivals.map((f) => (
              <div key={f.id} className="paper-grain bg-card p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">{f.image_url ? <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">无图</span>}</div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3"><div><label className="text-xs text-muted-foreground">日期</label><p className="text-sm font-medium">{f.date}</p></div>
                  {editingId === f.id ? (<><div><input value={editValues.name || ''} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="w-full px-2 py-1 text-sm rounded border" /></div><div><input value={editValues.tag || ''} onChange={(e) => setEditValues({ ...editValues, tag: e.target.value })} className="w-full px-2 py-1 text-sm rounded border" /></div><div><input value={editValues.copy || ''} onChange={(e) => setEditValues({ ...editValues, copy: e.target.value })} className="w-full px-2 py-1 text-sm rounded border" /></div></>) : (<><div><label className="text-xs text-muted-foreground">名称</label><p className="text-sm">{f.name}</p></div><div><label className="text-xs text-muted-foreground">标签</label><p className="text-sm">{f.tag}</p></div><div><label className="text-xs text-muted-foreground">文案</label><p className="text-sm text-muted-foreground line-clamp-1">{f.copy}</p></div></>)}
                </div>
                <div className="flex items-center gap-2">{editingId === f.id ? (<><button onClick={() => saveEdit(f.id)} className="p-2 rounded-lg bg-foreground text-background"><Check className="w-4 h-4" /></button><button onClick={() => setEditingId(null)} className="p-2 rounded-lg border"><X className="w-4 h-4" /></button></>) : (<><button onClick={() => { setUploadTargetId(f.id); fileInputRef.current?.click(); }} className="p-2 rounded-lg border">{uploadingId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</button><button onClick={() => startEdit(f)} className="px-3 py-2 rounded-lg border text-sm">编辑</button></>)}</div>
              </div>))}</div>)}
      </div><input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
    </main>
  );
}
