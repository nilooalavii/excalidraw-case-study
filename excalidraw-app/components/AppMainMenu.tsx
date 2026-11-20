import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import type { Theme } from "@excalidraw/element/types";

export const AppMainMenu: React.FC<{
  theme: Theme | "system";
}> = React.memo((props) => {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Preferences />
      <MainMenu.DefaultItems.ToggleTheme allowSystemTheme theme={props.theme} />
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
