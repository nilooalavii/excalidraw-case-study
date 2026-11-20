import type { ToolbarMeta, ToolbarProps } from "../types";

import "./signal-red.css";

export const meta: ToolbarMeta = {
  name: "Signal Red",
  idea: "A vermilion toolbar with a live tool readout and an underlined active control.",
};

export default function SignalRedToolbar({
  tools,
  activeTool,
  appState,
  renderDefault,
}: ToolbarProps) {
  const active = tools.find((tool) => tool.type === activeTool);

  return (
    <div
      className="toolbar-signal-red"
      data-zen={appState.zenModeEnabled || undefined}
    >
      {!appState.zenModeEnabled && active && (
        <div className="toolbar-signal-red__status" title={active.label}>
          <span className="toolbar-signal-red__glyph" aria-hidden="true">
            {active.icon}
          </span>
          <span className="toolbar-signal-red__copy">
            <span className="toolbar-signal-red__eyebrow">Active tool</span>
            <strong>{active.label}</strong>
          </span>
        </div>
      )}
      {renderDefault()}
    </div>
  );
}
