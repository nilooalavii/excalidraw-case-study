import { capitalizeString, DEFAULT_SIDEBAR } from "@excalidraw/common";

import { t } from "../i18n";

import { HintViewer } from "./HintViewer";
import {
  getToolLetter,
  getToolShortcut,
  isToolButtonDisabled,
  TOOLS,
} from "./Tools";

import type { ToolbarToolType } from "./Tools";
import type { ActionManager } from "../actions/manager";
import type {
  AppClassProperties,
  ExcalidrawProps,
  ToolType,
  UIAppState,
} from "../types";
import type { EditorInterface } from "@excalidraw/common";

/** Tools on the toolbar itself, in Excalidraw's order. */
const MAIN_TOOLS: readonly ToolbarToolType[] = [
  "hand",
  "selection",
  "rectangle",
  "diamond",
  "ellipse",
  "arrow",
  "line",
  "freedraw",
  "text",
  "stickynote",
  "eraser",
];

/** Tools Excalidraw keeps in the "More tools" menu. */
const MORE_TOOLS: readonly ToolbarToolType[] = [
  "image",
  "frame",
  "embeddable",
  "autoshape",
  "laser",
  "bucketfill",
  "lasso",
];

export type ToolbarTool = {
  type: ToolbarToolType;
  /** "main" tools sit on Excalidraw's toolbar, "more" ones in its menu */
  group: "main" | "more";
  label: string;
  icon: React.ReactNode;
  /** for tooltips, for example "R or 2" */
  shortcut: string | null;
  /** the short key hint Excalidraw shows in a button corner, for example "R" */
  keyHint: string | null;
  active: boolean;
  disabled: boolean;
  select: () => void;
};

export type ToolbarSlotProps = {
  /** every tool, main ones first, in Excalidraw's order */
  tools: ToolbarTool[];
  activeTool: ToolType | "custom";
  /** whether the active tool stays on after drawing */
  locked: boolean;
  toggleLock: () => void;
  formFactor: EditorInterface["formFactor"];
  /** renders Excalidraw's own toolbar */
  renderDefault: () => React.ReactNode;
  /** renders the hint Excalidraw shows below the toolbar while drawing */
  renderHint: () => React.ReactNode;
  openLibrary: () => void;
  openCommandPalette: () => void;
  undo: () => void;
  redo: () => void;
  /** escape hatches for anything else */
  app: AppClassProperties;
  appState: UIAppState;
};

const toTool = (
  type: ToolbarToolType,
  group: ToolbarTool["group"],
  app: AppClassProperties,
  appState: UIAppState,
): ToolbarTool => ({
  type,
  group,
  label: capitalizeString(t(`toolBar.${type}`)),
  icon: TOOLS[type].icon,
  shortcut: TOOLS[type].letterKey || TOOLS[type].numericKey
    ? getToolShortcut(type)
    : null,
  keyHint: getToolLetter(type) || TOOLS[type].numericKey || null,
  active: appState.activeTool.type === type,
  disabled: isToolButtonDisabled(app, type),
  select: () => {
    if (app.state.activeTool.type !== type) {
      app.setActiveTool({ type });
    }
  },
});

export const ToolbarSlot = ({
  app,
  appState,
  actionManager,
  editorInterface,
  onLockToggle,
  renderToolbar,
  renderDefault,
}: {
  app: AppClassProperties;
  appState: UIAppState;
  actionManager: ActionManager;
  editorInterface: EditorInterface;
  onLockToggle: () => void;
  renderToolbar: NonNullable<ExcalidrawProps["renderToolbar"]>;
  renderDefault: () => React.ReactNode;
}) => {
  const props: ToolbarSlotProps = {
    tools: [
      ...MAIN_TOOLS.map((type) => toTool(type, "main", app, appState)),
      ...MORE_TOOLS.map((type) => toTool(type, "more", app, appState)),
    ],
    activeTool: appState.activeTool.type,
    locked: appState.activeTool.locked,
    toggleLock: onLockToggle,
    formFactor: editorInterface.formFactor,
    renderDefault,
    renderHint: () => (
      <HintViewer
        appState={appState}
        isMobile={editorInterface.formFactor === "phone"}
        editorInterface={editorInterface}
        app={app}
      />
    ),
    openLibrary: () => {
      app.api.toggleSidebar({
        name: DEFAULT_SIDEBAR.name,
        tab: DEFAULT_SIDEBAR.defaultTab,
      });
    },
    openCommandPalette: () => {
      app.setOpenDialog({ name: "commandPalette" });
    },
    undo: () => {
      actionManager.executeAction(actionManager.actions.undo, "ui");
    },
    redo: () => {
      actionManager.executeAction(actionManager.actions.redo, "ui");
    },
    app,
    appState,
  };

  return <>{renderToolbar(props)}</>;
};
