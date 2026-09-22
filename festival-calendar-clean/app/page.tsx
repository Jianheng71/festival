"use client';
import { useEffect, useState, useRef } from 'react';
import { supabase, type Festival } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';
export default function HomePage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    async function fetchFestivals() {
      const { data } = await supabase.from('festivals').select('*').order('date', { ascending: true });
      setFestivals(data || []);
      setLoading(false);
    }
    fetchFestivals();
  }, []);
  useEffect(() => {
    const dateStr = formatDateForDB(selectedDate);
    const match = festivals.find((f) => f.date === dateStr);
    setCurrentFestival(match || null);
  }, [selectedDate, festivals]);
  const formatDateForDB = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const changeDate = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    setSelectedDate(newDate);
  };
  const handleGeneratePoster = async () => {
    if (!cardRef.current || !currentFestival) return;
    setGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        width: 1080, height: 1920, backgroundColor: '#f5f0e8', useCORS: true, logging: false, windowWidth: 1080, windowHeight: 1920,
      } as any);
      const link = document.createElement('a');
      link.download = `${currentFestival.name}_${formatDateForDB(selectedDate)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error(err); } finally { setGenerating(false); }
  };
  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  return (
    <main className="min-h-screen paper-texture flex flex-col items-center justify-between px-6 py-8 md:py-12">
      <header className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /><span className="text-sm font-medium tracking-wide">节日日历</span></div>
        <nav className="flex gap-4 text-sm"><a href="/admin" className="text-muted-foreground hover:text-foreground">后台</a><a href="/upload" className="text-muted-foreground hover:text-foreground">上传</a></nav>
      </header>
      <div className="w-full max-w-md flex-1 flex items-center justify-center py-8">
        {loading ? (<div className="w-full" style={{ aspectRatio: '9 / 16', maxWidth: '360px' }}><div className="w-full h-full rounded-2xl bg-muted animate-pulse" /></div>) : currentFestival ? (
          <div key={currentFestival.id} className="w-full animate-scale-in" style={{ maxWidth: '360px' }}>
            <div ref={cardRef} className="paper-grain bg-card relative overflow-hidden" style={{ aspectRatio: '9 / 16' }}>
              {currentFestival.image_url && (<div className="absolute inset-0 z-0"><img src={currentFestival.image_url} alt={currentFestival.name} className="w-full h-full object-cover" crossOrigin="anonymous" /><div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" /></div>)}
              <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
                <div className="flex items-start justify-between"><span className="text-xs font-medium tracking-widest uppercase text-foreground/70 px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm">{currentFestival.tag || '节日'}</span><span className="text-xs text-foreground/50 font-medium">{selectedDate.getFullYear()}</span></div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-4"><div className="font-serif font-black leading-none text-center" style={{ fontSize: 'clamp(120px, 35vw, 180px)', color: currentFestival.image_url ? '#ffffff' : 'hsl(var(--foreground))', textShadow: currentFestival.image_url ? '0 2px 20px rgba(0,0,0,0.3)' : 'none' }}>{String(selectedDate.getDate()).padStart(2, '0')}</div><div className="mt-2 text-sm font-medium tracking-widest" style={{ color: currentFestival.image_url ? 'rgba(255,255,255,0.85)' : 'hsl(var(--muted-foreground))' }}>{monthNames[selectedDate.getMonth()]} · 星期{dayOfWeek[selectedDate.getDay()]}</div></div>
                <div><h2 className="font-serif font-bold text-2xl md:text-3xl mb-2 text-balance" style={{ color: currentFestival.image_url ? '#ffffff' : 'hsl(var(--foreground))', textShadow: currentFestival.image_url ? '0 2px 12px rgba(0,0,0,0.25)' : 'none' }}>{currentFestival.name}</h2>{currentFestival.copy && (<p className="text-sm leading-relaxed text-balance" style={{ color: currentFestival.image_url ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted-foreground))' }}>{currentFestival.copy}</p>)}</div>
              </div>
            </div>
          </div>
        ) : (<div className="w-full paper-grain bg-card flex flex-col items-center justify-center text-center p-12" style={{ aspectRatio: '9 / 16', maxWidth: '360px' }}><div className="font-serif font-black leading-none mb-6" style={{ fontSize: 'clamp(100px, 30vw, 160px)', color: 'hsl(var(--muted-foreground))' }}>{String(selectedDate.getDate()).padStart(2, '0')}</div><p className="text-sm text-muted-foreground tracking-widest mb-4">{monthNames[selectedDate.getMonth()]} · 星期{dayOfWeek[selectedDate.getDay()]}</p><p className="font-serif text-lg text-foreground/60 mb-2">这一天还没有节日</p><p className="text-xs text-muted-foreground">去后台上传一个吧</p></div>)}
      </div>
      <footer className="w-full max-w-md flex items-center justify-between gap-4">
        <button onClick={() => changeDate(-1)} className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5"><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">前一天</span></button>
        <button onClick={handleGeneratePoster} disabled={!currentFestival || generating} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-30"><Download className="w-4 h-4" />{generating ? '生成中...' : '生成海报'}</button>
        <button onClick={() => changeDate(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5"><span className="hidden sm:inline">后一天</span><ChevronRight className="w-4 h-4" /></button>
      </footer>
    </main>
  );
}
