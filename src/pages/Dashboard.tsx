import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Scissors,
  Download,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Shirt,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface PatternRecord {
  id: string;
  tshirt_type: string;
  measurements: { height: number; chest: number; waist: number; hips: number };
  svg_content: string;
  report_text: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  oversize: 'Оверсайз',
  polo: 'Поло',
  regular: 'Обычный',
  slim: 'Слим-фит',
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [patterns, setPatterns] = useState<PatternRecord[]>([]);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [preview, setPreview] = useState<PatternRecord | null>(null);
  const [error, setError] = useState('');

  const fetchPatterns = useCallback(async () => {
    if (!user) return;
    setLoadingPatterns(true);
    const { data, error: err } = await supabase
      .from('pattern_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError('Не удалось загрузить историю');
    } else {
      setPatterns((data || []) as PatternRecord[]);
    }
    setLoadingPatterns(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchPatterns();
  }, [user, fetchPatterns]);

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('pattern_history').delete().eq('id', id);
    if (err) {
      setError('Не удалось удалить');
      return;
    }
    setPatterns(patterns.filter((p) => p.id !== id));
  };

  const handleDownload = (svg: string, type: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pattern-${type}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-clay" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-clay/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-clay" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-2">Войдите в аккаунт</h2>
          <p className="text-ink-muted text-sm mb-6">
            Личный кабинет доступен только авторизованным пользователям.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-clay transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-stone-light/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            На главную
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
              <span className="font-display text-cream text-base font-bold leading-none">A</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">Atelier</span>
          </div>

          <Link
            to="/workspace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream bg-ink px-4 py-2 rounded-full hover:bg-clay transition-colors"
          >
            <Scissors size={14} />
            Генератор
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-12 pb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-ink">Мои лекала</h1>
        <p className="text-ink-muted mt-2 text-[15px]">
          История ваших генераций выкроек. Просматривайте, скачивайте и удаляйте сохранённые чертежи.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-clay/5 border border-clay-soft/40">
            <AlertCircle size={18} className="text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-clay-dark">{error}</p>
          </div>
        )}

        {loadingPatterns ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-clay" />
          </div>
        ) : patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-cream-light border border-stone-light rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center mb-6">
              <Scissors size={28} className="text-ink-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">Пока нет сохранённых лекал</h3>
            <p className="text-ink-muted text-sm mt-2 max-w-sm text-center">
              Создайте выкройку в генераторе, и она автоматически появится здесь.
            </p>
            <Link
              to="/workspace"
              className="mt-6 inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-clay transition-colors"
            >
              <Scissors size={16} />
              Построить лекало
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {patterns.map((p) => (
              <div
                key={p.id}
                className="bg-cream-light border border-stone-light rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-ink/5 transition-all duration-300"
              >
                <div
                  className="h-48 bg-white border-b border-stone-light overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => setPreview(p)}
                >
                  <div
                    className="w-full h-full scale-[0.3] origin-center pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: p.svg_content }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt size={14} className="text-clay" />
                    <span className="text-sm font-semibold text-ink">
                      {TYPE_LABELS[p.tshirt_type] || p.tshirt_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-3">
                    <Calendar size={12} />
                    {formatDate(p.created_at)}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs text-ink-muted mb-4">
                    <span>Рост: {p.measurements?.height ?? '-'} см</span>
                    <span>Грудь: {p.measurements?.chest ?? '-'} см</span>
                    <span>Талия: {p.measurements?.waist ?? '-'} см</span>
                    <span>Бёдра: {p.measurements?.hips ?? '-'} см</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreview(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-ink/5 hover:bg-ink hover:text-cream text-ink-muted transition-all"
                    >
                      <Eye size={14} />
                      Открыть
                    </button>
                    <button
                      onClick={() => handleDownload(p.svg_content, p.tshirt_type)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-ink/5 hover:bg-ink hover:text-cream text-ink-muted transition-all"
                    >
                      <Download size={14} />
                      SVG
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-clay/5 hover:bg-clay hover:text-cream text-clay-dark transition-all"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-cream-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-stone-light"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-cream-light border-b border-stone-light px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {TYPE_LABELS[preview.tshirt_type] || preview.tshirt_type}
                </h3>
                <p className="text-xs text-ink-muted">{formatDate(preview.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(preview.svg_content, preview.tshirt_type)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-ink text-cream hover:bg-clay transition-colors"
                >
                  <Download size={14} />
                  Скачать SVG
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="w-9 h-9 rounded-full hover:bg-ink/5 flex items-center justify-center transition-colors"
                >
                  <X size={20} className="text-ink-muted" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-xl bg-white border border-stone-light p-4 overflow-auto mb-6">
                <div
                  className="w-full"
                  dangerouslySetInnerHTML={{ __html: preview.svg_content }}
                />
              </div>

              <div className="rounded-xl bg-cream border border-stone-light p-5">
                <h4 className="text-sm font-semibold text-ink mb-3">Расчёты</h4>
                <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                  {preview.report_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
