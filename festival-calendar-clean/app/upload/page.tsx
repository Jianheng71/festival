"use client';
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import { UploadCloud, ArrowLeft, Loader2, Check, Image as ImageIcon } from 'lucide-react';
export default function UploadPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return; setFile(f);
    const reader = new FileReader(); reader.onload = (e) => setPreview(e.target?.result as string); reader.readAsDataURL(f);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }, [handleFile]);
  const handleSubmit = async () => {
    if (!selectedDate || !file) return; setSubmitting(true); setSuccess(false);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.6, maxWidthOrHeight: 1920, useWebWorker: true });
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `upload_${Date.now()}.${ext}`;
      await supabase.storage.from('festival-images').upload(fileName, compressed, { contentType: compressed.type });
      const { data: urlData } = supabase.storage.from('festival-images').getPublicUrl(fileName);
      await supabase.from('festivals').insert({ date: selectedDate, name: '朋友上传', tag: '投稿', copy: '', image_url: urlData.publicUrl });
      setSuccess(true); setFile(null); setPreview(''); setSelectedDate('');
    } catch { alert('上传失败'); } finally { setSubmitting(false); }
  };
  return (
    <main className="min-h-screen paper-texture flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <header className="flex items-center justify-between mb-10"><a href="/" className="p-2 -ml-2 rounded-full hover:bg-foreground/5"><ArrowLeft className="w-5 h-5" /></a><h1 className="font-serif text-lg font-medium">分享你的节日</h1><div className="w-9" /></header>
        {success ? (<div className="text-center py-16"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-foreground/5 mb-6"><Check className="w-8 h-8 text-foreground" /></div><p className="font-serif text-xl font-medium mb-2">上传成功</p><p className="text-sm text-muted-foreground mb-8">谢谢你的分享</p><button onClick={() => setSuccess(false)} className="px-6 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-muted">再传一张</button></div>) : (
          <div className="space-y-6">
            <div><label className="text-xs text-muted-foreground mb-2 block">选择日期</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring/20" /></div>
            <div><label className="text-xs text-muted-foreground mb-2 block">拖入图片</label><div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => document.getElementById('upload-input')?.click()} className={`relative rounded-xl border-2 border-dashed cursor-pointer ${dragging ? 'border-foreground bg-foreground/5' : preview ? 'border-border' : 'border-border hover:border-foreground/30'}`} style={{ minHeight: '200px' }}>{preview ? (<div className="p-3 h-full"><div className="relative w-full h-44 rounded-lg overflow-hidden"><img src={preview} alt="preview" className="w-full h-full object-cover" /></div><p className="text-xs text-muted-foreground text-center mt-2 truncate">{file?.name}</p></div>) : (<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"><div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3">{dragging ? <UploadCloud className="w-6 h-6 text-foreground" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}</div><p className="text-sm text-muted-foreground">{dragging ? '松开即可上传' : '点击或拖拽图片到这里'}</p></div>)}<input id="upload-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} /></div></div>
            <button onClick={handleSubmit} disabled={!selectedDate || !file || submitting} className="w-full py-3.5 rounded-xl bg-foreground text-background font-medium hover:opacity-80 disabled:opacity-30 flex items-center justify-center gap-2">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" />上传中...</> : '提交'}</button>
          </div>)}
      </div>
    </main>
  );
}
