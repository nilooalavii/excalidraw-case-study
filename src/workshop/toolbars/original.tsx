import type { ToolbarMeta, ToolbarProps } from "../types";

export const meta: ToolbarMeta = {
  name: "Original",
  idea: "Excalidraw's toolbar as it ships.",
};

export default function OriginalToolbar({ renderDefault }: ToolbarProps) {
  return <>{renderDefault()}</>;
}
