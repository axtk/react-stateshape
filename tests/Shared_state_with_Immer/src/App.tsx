import { produce } from "immer";
import { createContext, useContext } from "react";
import { State, useExternalState } from "../../../index.ts";

let AppContext = createContext(new State({ counter: 0 }));

let Display = () => {
  let [state] = useExternalState(useContext(AppContext));

  return <span>{state.counter}</span>;
};

let PlusButton = () => {
  let [, setCounter] = useExternalState(useContext(AppContext));

  let handleClick = () => {
    // Same as with setters from `useState()`
    setCounter(
      produce((draft) => {
        // Immer makes the code of immutable state updates look like
        // direct mutations, which can facilitate manipulation of nested data.
        draft.counter++;
      }),
    );
  };

  return <button onClick={handleClick}>+</button>;
};

export let App = () => (
  <AppContext.Provider value={new State({ counter: 42 })}>
    <PlusButton /> <Display />
  </AppContext.Provider>
);
