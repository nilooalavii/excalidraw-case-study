import type { ComponentType } from "react";

import type {
  ToolbarSlotProps,
  ToolbarTool,
} from "@excalidraw/excalidraw/components/ToolbarSlot";

/**
 * What every toolbar variation receives. See AGENTS.md for a walkthrough.
 *
 * - `tools`: every tool with its label, icon, shortcut, `active` flag and a
 *   `select()` function. `group` is "main" (on Excalidraw's toolbar) or
 *   "more" (in its "More tools" menu).
 * - `locked` and `toggleLock()`: keep the tool on after drawing.
 * - `renderDefault()`: Excalidraw's own toolbar, if you want to wrap it.
 * - `renderHint()`: the hint Excalidraw shows while you draw.
 * - `openLibrary()`, `openCommandPalette()`, `undo()`, `redo()`.
 * - `app` and `appState`: escape hatches for anything else.
 */
export type ToolbarProps = ToolbarSlotProps;
export type { ToolbarTool };

export type ToolbarMeta = {
  /** shown in the lab switcher and on the page for everyone */
  name: string;
  /** one line on the idea behind it */
  idea: string;
};

export type ToolbarModule = {
  meta?: ToolbarMeta;
  default: ComponentType<ToolbarProps>;
};
