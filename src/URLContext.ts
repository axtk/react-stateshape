import { URLState } from "statepod";
import { createContext } from "react";

export const URLContext = createContext(
  new URLState(null, { autoStart: false }),
);
