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
    <fieldset className="frame-picker">
      <legend>Pick a photo frame</legend>
      <div className="frame-options">
        {FRAMES.map(({ key, label }) => {
          const [paper, accent, background] = FRAME_STYLES[key];
          const selected = frame === key;
          return (
            <button
              key={key}
              className="frame-option"
              type="button"
              aria-pressed={selected}
              onClick={() => setFrame(key)}
            >
              <span
                className="frame-swatch"
                style={{ background, borderColor: accent }}
                aria-hidden="true"
              >
                <span className={`frame-mini-print frame-mini-print--${key}`} style={{ background: paper }}>
                  <span className="frame-mini-rail" />
                  {[0, 1, 2, 3].map((tile) => (
                    <span
                      className="frame-mini-tile"
                      key={tile}
                      style={{ background: accent, opacity: 0.42 + tile * 0.12 }}
                    />
                  ))}
                  <span className="frame-mini-rail" />
                </span>
                {selected && <span className="frame-selected-mark">✓</span>}
              </span>
              <span className="frame-option-label">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
