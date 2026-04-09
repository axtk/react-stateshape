import { createContext } from "react";
import { Route } from "bridgestate";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
