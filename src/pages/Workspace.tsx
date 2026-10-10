import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Ruler,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Scissors,
  Shirt,
  Download,
  Calculator,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WatermarkOverlay from '@/components/WatermarkOverlay';
import { Lock } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';
type TshirtType = 'oversize' | 'polo' | 'regular' | 'slim';

interface GenerateResult {
  prompt: string;
  svg: string;
}

const TSHIRT_OPTIONS: { value: TshirtType; label: string; desc: string }[] = [
  { value: 'oversize', label: 'Оверсайз', desc: 'Свободный силуэт' },
  { value: 'polo', label: 'Поло', desc: 'Воротник-поло, приталенный' },
  { value: 'regular', label: 'Обычный', desc: 'Прямой силуэт' },
  { value: 'slim', label: 'Слим-фит', desc: 'Приталенный, узкий' },
];

export default function Workspace() {
  const { user } = useAuth();
  const [height, setHeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [tshirtType, setTshirtType] = useState<TshirtType>('regular');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [resultSubTab, setResultSubTab] = useState<'analysis' | 'image'>('analysis');
  const validateInput = (): string | null => {
    const fields = [
      { val: height, label: 'Рост', min: 100, max: 250 },
      { val: chest, label: 'Обхват груди', min: 50, max: 200 },
      { val: waist, label: 'Обхват талии', min: 40, max: 180 },
      { val: hips, label: 'Обхват бёдер', min: 50, max: 200 },
    ];
    for (const f of fields) {
      if (!f.val) return `Заполните поле «${f.label}».`;
      const n = Number(f.val);
      if (isNaN(n)) return `«${f.label}» должен быть числом.`;
      if (n <= 0) return `«${f.label}» должен быть больше 0.`;
      if (n < f.min || n > f.max) return `«${f.label}» должен быть в диапазоне ${f.min}–${f.max} см.`;
    }
    return null;
  };

  const handleGenerate = async () => {
    const validationError = validateInput();
    if (validationError) {
      setErrorMsg(validationError);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setActiveTab('result');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData?.session?.access_token || supabaseKey;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-pattern`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          measurements: {
            height: Number(height),
            chest: Number(chest),
            waist: Number(waist),
            hips: Number(hips),
          },
          tshirtType,
        }),
      });

      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Слишком много запросов. Попробуйте через минуту.');
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Ошибка сервера (${response.status})`);
      }

      const data = await response.json();

      if (!data || data.success === false) {
        throw new Error(data?.error || 'Не удалось выполнить расчёт. Попробуйте позже.');
      }

      if (!data.prompt && !data.svg) {
        throw new Error('Сервер вернул неполный ответ. Попробуйте снова.');
      }

      setResult({ prompt: data.prompt, svg: data.svg || '' });
      setStatus('success');

      if (user) {
        setSavedMsg('');
        const { error: saveErr } = await supabase.from('pattern_history').insert({
          tshirt_type: tshirtType,
          measurements: { height: Number(height), chest: Number(chest), waist: Number(waist), hips: Number(hips) },
          svg_content: data.svg || '',
          report_text: data.prompt || '',
        });
        setSavedMsg(saveErr ? 'Не удалось сохранить в историю' : 'Сохранено в историю');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка. Проверьте подключение и попробуйте снова.';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setActiveTab('input');
    setResultSubTab('analysis');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-xl border-b border-stone-light/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to home
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
              <span className="font-display text-cream text-base font-bold leading-none">A</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Atelier
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
              >
                <LayoutDashboard size={14} />
                Кабинет
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-clay/10 border border-clay-soft/40">
              <span className="w-2 h-2 rounded-full bg-clay animate-shimmer" />
              <span className="text-xs font-medium text-clay-dark">
                {user ? user.email?.split('@')[0] : 'гость'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Page heading */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-8">
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-ink">
          Параметрический генератор лекал
        </h1>
        <p className="text-ink-muted mt-2 text-[15px]">
          Введите мерки — получите точный математический чертёж выкройки.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex gap-1 border-b border-stone-light">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'input'
                ? 'text-ink'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2">
              <Ruler size={15} />
              Input
            </span>
            {activeTab === 'input' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'result'
                ? 'text-ink'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={15} />
              Result
              {status === 'success' && (
                <span className="w-1.5 h-1.5 rounded-full bg-clay" />
              )}
            </span>
            {activeTab === 'result' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {activeTab === 'input' && (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
            {/* Info panel */}
            <div className="bg-cream-light border border-stone-light rounded-2xl p-7">
              <h2 className="font-display text-lg font-semibold text-ink mb-1 flex items-center gap-2">
                <Calculator size={18} className="text-clay" />
                Как это работает
              </h2>
              <p className="text-sm text-ink-muted mb-5">
                Все расчёты выполняются на сервере по детерминированным формулам конструирования одежды.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-clay">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Введите мерки</p>
                    <p className="text-xs text-ink-muted mt-0.5">Рост, обхваты груди, талии и бёдер</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-clay">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">JS-формулы считают параметры</p>
                    <p className="text-xs text-ink-muted mt-0.5">ШИ, Ди, горловина, пройма, рукав, воротник</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-clay">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Мгновенный SVG-чертёж</p>
                    <p className="text-xs text-ink-muted mt-0.5">Точный векторный чертёж выкройки на экране</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurements + T-shirt type */}
            <div className="bg-cream-light border border-stone-light rounded-2xl p-7">
              <h2 className="font-display text-lg font-semibold text-ink mb-1 flex items-center gap-2">
                <User size={18} className="text-clay" />
                Body Measurements
              </h2>
              <p className="text-sm text-ink-muted mb-5">
                Enter anthropometric parameters in centimeters.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <MeasurementField
                  label="Height"
                  value={height}
                  onChange={setHeight}
                  unit="cm"
                />
                <MeasurementField
                  label="Chest"
                  value={chest}
                  onChange={setChest}
                  unit="cm"
                />
                <MeasurementField
                  label="Waist"
                  value={waist}
                  onChange={setWaist}
                  unit="cm"
                />
                <MeasurementField
                  label="Hips"
                  value={hips}
                  onChange={setHips}
                  unit="cm"
                />
              </div>

              {/* T-shirt type selector */}
              <div className="mt-6">
                <label className="text-xs font-medium text-ink-muted mb-2 flex items-center gap-1.5">
                  <Shirt size={14} className="text-clay" />
                  Тип изделия
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TSHIRT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTshirtType(opt.value)}
                      className={`text-left px-4 py-3 rounded-xl border transition-all ${
                        tshirtType === opt.value
                          ? 'border-clay bg-clay/8 ring-1 ring-clay/20'
                          : 'border-stone-light bg-cream hover:border-stone'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-ink">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-ink-muted mt-0.5">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === 'loading'}
                className="group w-full mt-7 inline-flex items-center justify-center gap-2.5 bg-ink text-cream px-6 py-4 rounded-full font-semibold text-sm hover:bg-clay transition-all duration-300 hover:shadow-xl hover:shadow-clay/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Расчёт...
                  </>
                ) : (
                  <>
                    <Scissors size={18} />
                    Построить лекало
                  </>
                )}
              </button>

              {status === 'error' && (
                <div className="mt-4 flex items-start gap-2.5 p-4 rounded-xl bg-clay/5 border border-clay-soft/40">
                  <AlertCircle size={18} className="text-clay flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-clay-dark">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'result' && (
          <div>
            {status === 'loading' && <LoadingState />}
            {status === 'error' && (
              <ErrorState message={errorMsg} onRetry={handleReset} />
            )}
            {status === 'idle' && (
              <EmptyState onGoInput={() => setActiveTab('input')} />
            )}
            {status === 'success' && result && (
              <div className="max-w-3xl mx-auto">
                {/* Sub-tabs */}
                <div className="flex gap-1 mb-6 border-b border-stone-light">
                  <button
                    onClick={() => setResultSubTab('analysis')}
                    className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
                      resultSubTab === 'analysis'
                        ? 'text-ink'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={15} />
                      Анализ и расчёты
                    </span>
                    {resultSubTab === 'analysis' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
                    )}
                  </button>
                  <button
                    onClick={() => setResultSubTab('image')}
                    className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
                      resultSubTab === 'image'
                        ? 'text-ink'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ImageIcon size={15} />
                      Изображение
                    </span>
                    {resultSubTab === 'image' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-clay" />
                    )}
                  </button>
                </div>

                {/* Analysis sub-tab */}
                {resultSubTab === 'analysis' && (
                  <div className="bg-cream-light border border-stone-light rounded-2xl p-7">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                        <Sparkles size={18} className="text-clay" />
                        Анализ и расчёты
                      </h2>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-ink/5 hover:bg-ink hover:text-cream text-ink-muted transition-all"
                      >
                        {copied ? (
                          <>
                            <Check size={14} />
                            Скопировано
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Копировать
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-xl bg-cream border border-stone-light p-6">
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                        {result.prompt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Image sub-tab — SVG pattern */}
                {resultSubTab === 'image' && (
                  <div className="bg-cream-light border border-stone-light rounded-2xl p-7">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                        <ImageIcon size={18} className="text-clay" />
                        Чертёж выкройки (SVG)
                      </h2>
                      {!user && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-dark bg-clay/5 px-3 py-1.5 rounded-full border border-clay-soft/40">
                          <Lock size={12} />
                          Войдите, чтобы скачать
                        </span>
                      )}
                      {result.svg && user && (
                        <button
                          onClick={() => {
                            const blob = new Blob([result.svg], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'pattern.svg';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-ink/5 hover:bg-ink hover:text-cream text-ink-muted transition-all"
                        >
                          <Download size={14} />
                          Скачать SVG
                        </button>
                      )}
                    </div>

                    {result.svg ? (
                      <div className="relative rounded-xl bg-white border border-stone-light p-4 overflow-auto">
                        <div
                          className="w-full"
                          dangerouslySetInnerHTML={{ __html: result.svg }}
                        />
                        {!user && <WatermarkOverlay visible={true} />}
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-stone flex flex-col items-center justify-center gap-3 bg-cream h-80">
                        <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center">
                          <ImageIcon size={24} className="text-ink-muted" />
                        </div>
                        <span className="text-sm font-medium text-ink-muted">
                          Чертёж не был сгенерирован
                        </span>
                        <span className="text-xs text-ink-muted/60">
                          Попробуйте сгенерировать заново
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Save status */}
                {savedMsg && (
                  <div className="flex justify-center mt-4">
                    <span className={`text-xs font-medium ${savedMsg.includes('Не удалось') ? 'text-clay-dark' : 'text-clay'}`}>
                      {savedMsg}
                    </span>
                  </div>
                )}

                {/* Generate another pattern button at the bottom */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink border border-stone-light hover:border-stone rounded-full px-8 py-3.5 transition-colors"
                  >
                    <Scissors size={16} />
                    Построить другое лекало
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MeasurementField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-muted mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-cream border border-stone-light rounded-xl px-4 py-3 text-sm text-ink font-medium focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/20 transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted/60 pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-stone-light" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-clay border-t-transparent animate-spin" />
        <Sparkles size={28} className="text-clay absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mt-8">
        Рассчитываем выкройку...
      </h3>
      <p className="text-ink-muted text-sm mt-2 max-w-sm text-center">
        JavaScript-формулы вычисляют все параметры и строят точный SVG-чертёж. Это занимает доли секунды.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-full bg-clay/10 flex items-center justify-center mb-6">
        <AlertCircle size={28} className="text-clay" />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">
        Не удалось построить лекало
      </h3>
      <p className="text-ink-muted text-sm mt-2 max-w-sm text-center">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-clay transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
}

function EmptyState({ onGoInput }: { onGoInput: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center mb-6">
        <Sparkles size={28} className="text-ink-muted" />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">
        Пока нет результатов
      </h3>
      <p className="text-ink-muted text-sm mt-2 max-w-sm text-center">
        Введите мерки, чтобы получить точный математический чертёж выкройки.
      </p>
      <button
        onClick={onGoInput}
        className="mt-6 inline-flex items-center gap-2 bg-ink text-cream px-6 py-3 rounded-full text-sm font-semibold hover:bg-clay transition-colors"
      >
        Ввести мерки
      </button>
    </div>
  );
}
