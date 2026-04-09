import type { NavigationOptions } from "bridgestate";
import { useContext, useMemo } from "react";
import { RouteContext } from "./RouteContext.ts";
import type { RenderCallback } from "./types/RenderCallback.ts";
import { useExternalState } from "./useExternalState.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  let route = useContext(RouteContext);

  useExternalState(route, callback, "navigation");

  return useMemo(
    () => ({
      route,
      at: route.at.bind(route),
    }),
    [route],
  );
}
