import { createContext } from "react";
import { URLState } from "bridgestate";

export const URLContext = createContext(
  new URLState(null, { autoStart: false }),
);
