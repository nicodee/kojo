import { useState, useMemo, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  AlertTriangle, 
  X, 
  ChevronUp, 
  Check, 
  Plus, 
  Clock, 
  Navigation, 
  Share2, 
  Trash2,
  Info
} from 'lucide-react';
import { STOCKHOLM_PLACES } from './data/places';
import { Place } from './types';

export default function App() {
  const [places] = useState<Place[]>(STOCKHOLM_PLACES);
  const [dayQueue, setDayQueue] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sthlm_day_queue');
      return saved ? JSON.parse(saved) : ['vasa-museum', 'fotografiska', 'vete-katten-fika'];
    } catch {
      return ['vasa-museum', 'fotografiska', 'vete-katten-fika'];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [rainMode, setRainMode] = useState<boolean>(false);
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

  // Sync queue to localStorage for persistent offline use
  useEffect(() => {
    try {
      localStorage.setItem('sthlm_day_queue', JSON.stringify(dayQueue));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [dayQueue]);

  const toggleQueue = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(12);
    setDayQueue((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (rainMode && !place.isIndoor) return false;
      if (activeCategory === 'all') return true;
      if (activeCategory === 'free') return place.costSek === 0;
      return place.category === activeCategory;
    });
  }, [places, activeCategory, rainMode]);

  const queuedPlaces = useMemo(() => {
    return dayQueue
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => Boolean(p));
  }, [dayQueue, places]);

  const totalCostSek = useMemo(() => {
    return queuedPlaces.reduce((sum, p) => sum + p.costSek, 0);
  }, [queuedPlaces]);

  const totalDurationMin = useMemo(() => {
    return queuedPlaces.reduce((sum, p) => sum + p.durationMin, 0);
  }, [queuedPlaces]);

  // Group queued places by island for geographic route optimization
  const groupedByIsland = useMemo(() => {
    const groups: Record<string, Place[]> = {};
    queuedPlaces.forEach((place) => {
      const island = place.neighborhood;
      if (!groups[island]) groups[island] = [];
      groups[island].push(place);
    });
    return groups;
  }, [queuedPlaces]);

  const activeDetailPlace = useMemo(() => {
    return places.find((p) => p.id === activeDetailId);
  }, [places, activeDetailId]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex justify-center selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md min-h-screen relative flex flex-col pb-32">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#090a0f]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                Stockholm · MBA Guide
              </div>
              <h1 className="text-base font-bold tracking-tight text-neutral-100">
                Pick Your Day
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRainMode(!rainMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  rainMode 
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' 
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
                title="Toggle rain/indoor backup mode"
              >
                {rainMode ? <CloudRain className="w-3.5 h-3.5 text-sky-300" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>{rainMode ? 'Rain Mode' : 'Clear'}</span>
              </button>

              <button
                onClick={() => setShowSosModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-mono font-bold"
                title="Transit warnings and student rules"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>SOS</span>
              </button>
            </div>
          </div>

          {/* Vibe Filter Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Sights' },
              { id: 'free', label: 'Free Only' },
              { id: 'museum', label: 'Culture' },
              { id: 'tech-mba', label: 'Tech & MBA' },
              { id: 'eats-fika', label: 'Fika & Eats' },
              { id: 'nightlife', label: 'Nightlife' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        {/* Places Feed */}
        <main className="px-4 pt-4 space-y-3 flex-1 overflow-y-auto">
          {rainMode && (
            <div className="bg-sky-950/40 border border-sky-800/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-200 animate-in fade-in">
              <CloudRain className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-sky-100">Rain & Cold Mode:</span> Outdoor cliff walks hidden. Showing indoor museums, heated architecture hubs, and covered food halls.
              </div>
            </div>
          )}

          <div className="text-xs text-neutral-500 font-medium px-1 flex justify-between items-center">
            <span>{filteredPlaces.length} places available</span>
            <span>Tap '+' to add to day</span>
          </div>

          {filteredPlaces.map((place) => {
            const isQueued = dayQueue.includes(place.id);
            return (
              <div
                key={place.id}
                className={`rounded-2xl border transition-all duration-200 p-4 ${
                  isQueued 
                    ? 'bg-neutral-900/95 border-emerald-500/40 shadow-sm shadow-emerald-500/10' 
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase bg-neutral-800 text-neutral-300">
                        {place.neighborhood}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {place.durationMin}m
                      </span>
                      <span className={`text-[11px] font-mono font-medium ${place.costSek === 0 ? 'text-emerald-400' : 'text-neutral-300'}`}>
                        {place.costLabel}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-100 leading-snug">
                      {place.title}
                    </h3>

                    <p className="mt-1 text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {place.mbaNote}
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => setActiveDetailId(place.id)}
                        className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 underline underline-offset-2"
                      >
                        <Info className="w-3 h-3" />
                        Tips & Transit
                      </button>
                      {place.studentDiscountNote.includes('French') && (
                        <span className="text-[10px] font-mono bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          🎓 French ID OK
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleQueue(place.id)}
                    aria-label={isQueued ? 'Remove from day' : 'Add to day'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                      isQueued
                        ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                    }`}
                  >
                    {isQueued ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </main>

        {/* Floating Sticky Day Tray */}
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 flex justify-center pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <button
              onClick={() => setIsTrayOpen(true)}
              className="w-full bg-neutral-900/95 hover:bg-neutral-850/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-3 shadow-2xl flex items-center justify-between text-left transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  {dayQueue.length}
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100 flex items-center gap-1.5">
                    <span>My Stockholm Day</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                      {Math.round(totalDurationMin / 60 * 10) / 10} hrs
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Spend: {totalCostSek} SEK (~€{Math.round(totalCostSek / 11.2)})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <span>View Route</span>
                <ChevronUp className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Full Day Route Drawer */}
        {isTrayOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-w-md w-full mx-auto max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="px-5 pt-4 pb-3 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-100">
                    Your Day Route Plan
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Auto-clustered by island to stop transit backtracking
                  </p>
                </div>
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                {Object.keys(groupedByIsland).length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs">
                    No stops queued. Tap '+' on cards to build your day!
                  </div>
                ) : (
                  Object.entries(groupedByIsland).map(([island, items], index) => (
                    <div key={island} className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
                          Island Hub: {island}
                        </h4>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ({items.length} {items.length === 1 ? 'spot' : 'spots'})
                        </span>
                      </div>

                      <div className="border-l-2 border-neutral-800 ml-1 pl-4 space-y-2.5">
                        {items.map((place) => (
                          <div 
                            key={place.id}
                            className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3 flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-semibold text-neutral-200">
                                {place.title}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {place.transitTip}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-400 mt-1">
                                {place.costLabel} · {place.durationMin}m
                              </div>
                            </div>
                            <button
                              onClick={() => toggleQueue(place.id)}
                              className="text-neutral-500 hover:text-rose-400 text-xs p-1"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {index < Object.keys(groupedByIsland).length - 1 && (
                        <div className="py-1 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800/80 text-neutral-400 border border-neutral-700/50">
                            ⛴️ Ferry 82 or Metro to next island (43 SEK tap)
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {queuedPlaces.length > 0 && (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-semibold text-neutral-200">
                      Budget & Transit Summary
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                      <div>Activities: <span className="text-neutral-200">{totalCostSek} SEK</span></div>
                      <div>Est. Time: <span className="text-neutral-200">{Math.round(totalDurationMin / 60 * 10) / 10}h</span></div>
                      <div>Transit: <span className="text-neutral-200">{Object.keys(groupedByIsland).length} taps (~{Object.keys(groupedByIsland).length * 43} SEK)</span></div>
                      <div>Total Spend: <span className="text-emerald-400">~€{Math.round((totalCostSek + Object.keys(groupedByIsland).length * 43) / 11.2)}</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-neutral-800 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `My Stockholm Day:\n` +
                      queuedPlaces.map((p, i) => `${i + 1}. ${p.title} (${p.neighborhood})`).join('\n') +
                      `\nTotal Spend: ~${totalCostSek} SEK`
                    );
                    alert('Itinerary copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Route Plan</span>
                </button>
                <button
                  onClick={() => setDayQueue([])}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Place Detail Sheet */}
        {activeDetailPlace && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {activeDetailPlace.neighborhood} · {activeDetailPlace.tag}
                  </span>
                  <h3 className="text-base font-bold text-neutral-100 mt-1">
                    {activeDetailPlace.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDetailId(null)}
                  className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs leading-relaxed text-neutral-300">
                <p><strong className="text-neutral-100">Why it matters:</strong> {activeDetailPlace.mbaNote}</p>
                <p><strong className="text-neutral-100">Transit:</strong> {activeDetailPlace.transitTip}</p>
                <p><strong className="text-neutral-100">Student & Cost Note:</strong> {activeDetailPlace.studentDiscountNote}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    toggleQueue(activeDetailPlace.id);
                    setActiveDetailId(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                    dayQueue.includes(activeDetailPlace.id)
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                  }`}
                >
                  {dayQueue.includes(activeDetailPlace.id) ? 'Remove from Day' : '+ Add to My Day'}
                </button>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(activeDetailPlace.title + ' Stockholm')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Maps</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* SOS Modal */}
        {showSosModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-300">
                    Stockholm Transit & Student Rules
                  </h3>
                </div>
                <button
                  onClick={() => setShowSosModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                <div className="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl">
                  <strong className="text-amber-200 block mb-0.5">Avoid 1,850 SEK Transit Fine:</strong>
                  SL student tickets require a Swedish student card (Mecenat). French IDs do <em>not</em> qualify for public transit discounts.
                  <span className="text-neutral-200 block mt-1 font-mono">
                    → Tap French Visa/Mastercard directly for standard 43 SEK fare (valid 75 min).
                  </span>
                </div>

                <div className="space-y-1">
                  <strong className="text-neutral-100">🎓 French MBA ID Discounts:</strong>
                  <ul className="list-disc list-inside text-neutral-400 space-y-0.5 text-[11px]">
                    <li>Fotografiska: 135 SEK (vs 195 regular)</li>
                    <li>Moderna Museet: 140 SEK (vs 170 regular)</li>
                    <li>Vasa Museum: No student rate (all adults 195 SEK)</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <strong className="text-neutral-100">✈️ Airport Return:</strong>
                  <p className="text-[11px] text-neutral-400">
                    Flygbussarna coach: 99 SEK youth rate (≤25) vs 129 SEK standard. Arlanda Express: 160 SEK youth (≤25).
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <strong className="text-neutral-100">🇸🇪 Handy Local Words:</strong>
                  <p className="text-[11px] font-mono text-emerald-400">
                    Påtår (free coffee refill) · Tack tack (thanks!) · Skål (cheers!)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSosModal(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold"
              >
                Got It, Back to Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
