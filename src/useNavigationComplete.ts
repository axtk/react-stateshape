import type { EventCallback, NavigationOptions } from "bridgestate";
import { useContext, useEffect } from "react";
import { RouteContext } from "./RouteContext.ts";

export function useNavigationComplete(
  callback: EventCallback<NavigationOptions>,
) {
  let route = useContext(RouteContext);

  useEffect(() => route.on("navigationcomplete", callback), [route, callback]);
}
