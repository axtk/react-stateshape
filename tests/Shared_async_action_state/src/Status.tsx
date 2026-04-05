import { useTransientState } from "../../../index.ts";

export const Status = () => {
  // The hook accesses the async action state updated in the `ItemList`
  // component by using the same string key
  const [{ initial, pending, error }] = useTransientState("items");

  // if (initial) return <>⚪ Initial</>;

  if (initial || pending) return <>⏳ Busy</>;

  if (error) return <>❌ Error</>;

  return <>✔️ OK</>;
};
