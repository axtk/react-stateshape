import { Route } from "bridgestate";
import { createContext } from "react";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
