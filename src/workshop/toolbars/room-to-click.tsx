import type { ToolbarMeta, ToolbarProps } from "../types";

import "./room-to-click.css";

export const meta: ToolbarMeta = {
  name: "Room to Click",
  idea: "Larger targets and clear groups give the original tools room to breathe.",
};

export default function RoomToClickToolbar({ renderDefault }: ToolbarProps) {
  return <div className="toolbar-room-to-click">{renderDefault()}</div>;
}
