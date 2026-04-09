import { type ReactNode, useMemo, useRef } from "react";
import { State } from "bridgestate";
import { TransientStateContext } from "./TransientStateContext.ts";
import type { TransientState } from "./types/TransientState.ts";

export type TransientStateProviderProps = {
  value?:
    | Record<string, TransientState>
    | Map<string, State<TransientState>>
    | null
    | undefined;
  children?: ReactNode;
};

export const TransientStateProvider = ({
  value,
  children,
}: TransientStateProviderProps) => {
  let defaultValueRef = useRef<Map<string, State<TransientState>> | null>(null);

  let stateMap = useMemo(() => {
    if (value instanceof Map) return value;

    if (typeof value === "object" && value !== null)
      return new Map(
        Object.entries(value).map(([key, value]) => [key, new State(value)]),
      );

    if (defaultValueRef.current === null)
      defaultValueRef.current = new Map<string, State<TransientState>>();

    return defaultValueRef.current;
  }, [value]);

  return (
    <TransientStateContext.Provider value={stateMap}>
      {children}
    </TransientStateContext.Provider>
  );
};
