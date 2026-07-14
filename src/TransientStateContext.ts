import type { State } from "statepod";
import { createContext } from "react";
import type { TransientState } from "./types/TransientState.ts";

export const TransientStateContext = createContext(
  new Map<string, State<TransientState>>(),
);
