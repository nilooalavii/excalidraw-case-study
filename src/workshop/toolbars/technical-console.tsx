import type { ToolbarMeta, ToolbarProps } from "../types";

import "./technical-console.css";

export const meta: ToolbarMeta = {
  name: "Technical Console",
  idea: "A compact instrument strip with grouped controls and prominent shortcut keycaps.",
};

export default function TechnicalConsoleToolbar({
  renderDefault,
}: ToolbarProps) {
  return <div className="toolbar-technical-console">{renderDefault()}</div>;
}
