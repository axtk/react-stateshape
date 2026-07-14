import { createContext } from "react";
import { URLState } from "statepod";

export const URLContext = createContext(
  new URLState(null, { autoStart: false }),
);
