import { Route } from "statepod";
import { type ReactNode, useEffect, useMemo } from "react";
import { RouteContext } from "./RouteContext.ts";

export type RouteProviderProps = {
  href?: string | Route | undefined;
  children?: ReactNode;
};

/**
 * A component providing a Route instance to the nested components.
 */
export const RouteProvider = ({ href, children }: RouteProviderProps) => {
  let route = useMemo(() => {
    if (href instanceof Route) return href;
    else if (href === undefined || typeof href === "string")
      return new Route(href);
    else throw new Error("URLProvider's 'href' of unsupported type");
  }, [href]);

  useEffect(() => {
    route.start();

    return () => route.stop();
  }, [route]);

  return (
    <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
  );
};
