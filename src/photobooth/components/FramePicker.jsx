import { FRAMES } from "../constants.js";

const FRAME_STYLES = {
  classic: ["#fff0d2", "#e84c75", "#f9dce4"],
  arcade: ["#10132d", "#53f6e4", "#29204b"],
  polaroid: ["#fffdf8", "#c07c61", "#dfd2c5"],
  film: ["#24221f", "#f7edda", "#625145"],
  none: ["#f4f5f7", "#77849a", "#cdd7e3"],
};

export default function FramePicker({ frame, setFrame }) {
  return (
    <fieldset className="frame-picker rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm">
      <legend className="mb-3 block px-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Pick a photo frame
      </legend>
      <div className="frame-options flex flex-wrap gap-3">
        {FRAMES.map(({ key, label }) => {
          const [paper, accent, background] = FRAME_STYLES[key];
          const selected = frame === key;
          return (
            <button
              key={key}
              className={`frame-option inline-flex items-center gap-3 rounded-xl border px-2 py-2 text-left transition ${selected ? "border-primary-300 bg-primary-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              type="button"
              aria-pressed={selected}
              onClick={() => setFrame(key)}
            >
              <span
                className="frame-swatch relative flex h-16 w-16 items-center justify-center rounded-lg border-2"
                style={{ background, borderColor: accent }}
                aria-hidden="true"
              >
                <span className={`frame-mini-print frame-mini-print--${key} flex h-10 w-10 flex-col items-stretch justify-center rounded-[0.5rem] p-1`} style={{ background: paper }}>
                  <span className="frame-mini-rail h-1 w-full rounded-full bg-slate-200/70" />
                  {[0, 1, 2, 3].map((tile) => (
                    <span
                      className="frame-mini-tile mt-1 h-2 rounded-full"
                      key={tile}
                      style={{ background: accent, opacity: 0.42 + tile * 0.12 }}
                    />
                  ))}
                  <span className="frame-mini-rail mt-1 h-1 w-full rounded-full bg-slate-200/70" />
                </span>
                {selected && <span className="frame-selected-mark absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-700 text-[10px] text-white">✓</span>}
              </span>
              <span className="frame-option-label text-sm font-medium text-slate-700">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
