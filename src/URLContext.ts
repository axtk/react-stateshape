import { URLState } from "bridgestate";
import { createContext } from "react";

export const URLContext = createContext(
  new URLState(null, { autoStart: false }),
);
