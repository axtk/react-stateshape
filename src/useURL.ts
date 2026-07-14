import type { NavigationOptions } from "statepod";
import { useContext } from "react";
import type { RenderCallback } from "./types/RenderCallback.ts";
import { URLContext } from "./URLContext.ts";
import { useExternalState } from "./useExternalState.ts";

export function useURL(callback?: RenderCallback<NavigationOptions>) {
  return useExternalState(useContext(URLContext), callback, "navigation");
}
