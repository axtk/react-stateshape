import { createContext } from "react";
import { Route } from "statepod";

export const RouteContext = createContext(
  new Route(null, { autoStart: false }),
);
