import { createContext } from "react";
import type { State } from "bridgestate";
import type { TransientState } from "./types/TransientState.ts";

export const TransientStateContext = createContext(
  new Map<string, State<TransientState>>(),
);
