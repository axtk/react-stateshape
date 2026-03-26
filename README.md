# react-stateshape

A shared state management and routing lib for React apps. Under the hood, routing is shared state management, too, with the shared data being the URL.

Contents: [useExternalState](#useexternalstate) · [useRoute](#useroute) · [useNavigationStart / useNavigationComplete](#usenavigationstart--usenavigationcomplete) · [useRouteState](#useroutestate) · [Type-safe routes](#type-safe-routes) · [useTransientState](#usetransientstate) · [Annotated examples](#annotated-examples) · [Internals](#internals)

## useExternalState

This hook is focused on simplicity of both setting up shared state from scratch and migrating from local state. The equally common latter scenario is often missed out with commonly used approaches resulting in sizable code rewrites.

### Shared state

Move local state to the full-fledged shared state with minimal paradigm shift and minimal code changes:

```diff
+ import { State, useExternalState } from "react-stateshape";
+
+ let counterState = new State(0);

  let Counter = () => {
-   let [counter, setCounter] = useState(0);
+   let [counter, setCounter] = useExternalState(counterState);

    let handleClick = () => setCounter((value) => value + 1);

    return <button onClick={handleClick}>+ {counter}</button>;
  };

  let ResetButton = () => {
-   let [, setCounter] = useState(0);
+   let [, setCounter] = useExternalState(counterState, false);

    let handleClick = () => setCounter(0);

    return <button onClick={handleClick}>×</button>;
  };

  let App = () => <><Counter/>{" "}<ResetButton/></>;
```

### Sharing state via Context

With SSR, it's common practice to put shared values into React Context rather than module-level variables to avoid cross-request data sharing. The same applies to external state. Provide external state to multiple components via React Context like any data in a React app:

```diff
- let counterState = new State(0);
+ let AppContext = createContext(new State(0));
```

```diff
- let [counter, setCounter] = useExternalState(counterState);
+ let [counter, setCounter] = useExternalState(useContext(AppContext));
```

```jsx
let App = () => (
  <AppContext.Provider value={new State(42)}>
    <PlusButton/>{" "}<Display/>
  </AppContext.Provider>
);
```

⬥ Like any data in a React app, the external state can also be split across multiple instances of `State` and multiple Contexts to maintain clearer semantic boundaries and more targeted data update subscriptions.

⬥ Note that updating the `State` value doesn't change the instance's reference sitting in the React Context and therefore doesn't cause updates of the entire Context. Only the components subscribed to updates of the particular `State` instance by means of `useExternalState(state)` will be notified to re-render.

### Filtering state updates

⬥ Use the optional `false` parameter in `useExternalState(state, false)`, as in `ResetButton` above, to tell the hook not to subscribe the component to tracking the external state updates. The common use case for it is when a component makes use of the external state value setter without using the state value itself.

⬥ Apart from setting the optional second parameter of `useExternalState(state, callback)` to a boolean value, use it as a render callback for more fine-grained control over component's re-renders in response to state changes:

```js
let itemState = new State({/* A map of `<id>: <item>` */});

// Renders a specific item from `itemState`
let ItemCard = ({ id }) => {
  let [items, setItems] = useExternalState(itemState, (render, { current, previous }) => {
    // Assuming that the items have a `timestamp` property, re-render
    // `ItemCard` only if the relevant item's `timestamp` has increased
    if (current[id].timestamp > previous[id].timestamp) render();
  });

  // ...
};
```

### Integration with Immer

Immer can be used with state setters returned from `useExternalState()` just the same way as [with `useState()`](https://immerjs.github.io/immer/example-setstate#usestate--immer) to facilitate deeply nested data changes.

### Persistence across page reloads

Replace `State` with `PersistentState` as shown below to get the state data synced to the specified `key` in `localStorage` and restored on page reload. After a persistent state is created, use it with `useExternalState(state)` the same way as `State` instances.

```js
import { PersistentState } from "react-stateshape";

let counterState = new PersistentState(0, { key: "counter" });
```

⬥ Set `options.session` to `true` in `new PersistentState(value, options)` to use `sessionStorage`.

⬥ Set `options.serialize()` and `options.deserialize()` to override the default data transform behavior, including filtering and rearranging the data (it's `JSON.stringify()` and `JSON.parse()` by default).

⬥ Set up interaction with a custom storage by setting `{ read(), write(value)? }` as `options` in `new PersistentState(value, options)`.

⬥ `PersistentState` skips interaction with the browser storage in non-browser environments, which makes it usable with SSR. One way to avoid mismatch errors while hydrating SSR content based on a persisent state restored in the browser is using client-side rendering detection utilities such as [`react-clientside`](https://www.npmjs.com/package/react-clientside).

## useRoute

Use this hook for URL-based rendering and SPA navigation, which boil down to accessing and changing the current URL treated as shared state under the hood.

### URL-based rendering

URL-based rendering with `at(url, x, y)` shown below works similarly to conditional rendering with the ternary operator `atURL ? x : y`. It's equally applicable to props and components:

```jsx
import { useRoute } from "react-stateshape";

let App = () => {
  let { at } = useRoute();

  return (
    <header className={at("/", "full", "compact")}>
      <h1>App</h1>
    </header>
    {at("/", <Intro/>)}
    {at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => <Section id={params.id}/>)}
  );
};
```

⬥ `params` in dynamic values (as in `({ params }) => <Section id={params.id}/>` above) contains the URL pattern's capturing groups.

⬥ By default, `useRoute` makes use of the browser's URL, if it's available. Otherwise, use `<RouteProvider href={url}>` to set a specific URL value. Common use cases: SSR and tests. A less common use case: custom routing behavior, including custom non-URL-based routing ([example](https://codesandbox.io/p/sandbox/tykt44?file=%252Fsrc%252FApp.tsx)).

⬥ See also the [Type-safe routes](#type-safe-routes) section.

### SPA navigation

The SPA navigation API is largely aligned with the similar built-in APIs:

```diff
+ import { A, useRoute } from "react-stateshape";

  let UserNav = ({ signedIn }) => {
+   let { route } = useRoute();

    let handleClick = () => {
-     window.location.href = signedIn ? "/profile" : "/login";
+     route.href = signedIn ? "/profile" : "/login";
    };

    return (
      <nav>
-       <a href="/">Home</a>
+       <A href="/">Home</A>
        <button onClick={handleClick}>Profile</button>
      </nav>
    );
  };
```

⬥ `<A>` and `<Area>` are the two kinds of SPA route link components available out of the box. They have the same props and semantics as the corresponding HTML link elements `<a>` and `<area>`.

⬥ The `route` object returned from `useRoute()` exposes an API resembling the built-in APIs of `window.location` and `history` carried over to SPA navigation: `.assign(url)`, `.replace(url)`, `.reload()`, `.href`, `.pathname`, `.search`, `.hash`, `.back()`, `.forward()`, `.go(delta)`.

⬥ `route.navigate(options)` combines and extends `route.assign(url)` and `route.replace(url)` serving as a handy drop-in replacement for the similar `window.location` methods:

```js
route.navigate({ href: "/intro", history: "replace", scroll: "off" });
```

⬥ Tweak link components by adding a relevant combination of the optional `data-` props corresponding to the `options` of `route.navigate(options)`:

```jsx
<A href="/intro">Intro</A>
<A href="/intro" data-history="replace">Intro</A>
<A href="/intro" data-scroll="off">Intro</A>
<A href="/intro" data-spa="off">Intro</A>
```

Using HTML link attributes (including the `data-` attributes) as SPA link component props makes link components easily interchangeable with HTML links and understandable without prior knowledge.

⬥ Link components also automatically receive the `data-active="true"` prop whenever their `href` prop matches the current URL, which can be used for additional styling.

⬥ Use the optional `callback` parameter of `useRoute(callback?)` for more fine-grained control over the component rendering in response to URL changes. This callback receives the `render` function as a parameter that should be called at some point. Use cases for this render callback include, for example, activating animated view transitions ([example](https://codesandbox.io/p/sandbox/w4q95n?file=%252Fsrc%252FApp.tsx)) or (less likely in regular circumstances) skipping re-renders for certain URL changes.

## useNavigationStart / useNavigationComplete

These hooks set up optional actions to be done before and after a SPA navigation occurs respectively. Such intermediate actions are also known as routing middleware.

Some common examples of what can be handled with middleware include redirecting to another URL, preventing navigation with unsaved user input, setting the page title based on the current URL:

```jsx
import { useNavigationComplete, useNavigationStart } from "react-stateshape";

function setTitle({ href }) {
  document.title = href === "/intro" ? "Intro" : "App";
}

let App = () => {
  let { route } = useRoute();
  let [hasUnsavedChanges, setUnsavedChanges] = useState(false);

  let handleNavigationStart = useCallback(({ href }) => {
    if (hasUnsavedChanges)
      return false; // Preventing navigation

    if (href === "/") {
      route.href = "/intro"; // SPA redirection
      return false;
    }
  }, [hasUnsavedChanges, route]);

  useNavigationStart(handleNavigationStart);
  useNavigationComplete(setTitle);

  // ...
};
```

⬥ The object parameter of the hooks' callbacks has the shape of the `route.navigate()`'s options, including `href` and `referrer`, the navigation destination and initial URLs.

⬥ The callback of both hooks is first called when the component gets mounted if the route is already in the navigation-complete state.

## useRouteState

Use this hook to manage URL parameters as state in a `useState`-like manner. Use the React's state mental model and migrate from local state without major code rewrites:

```diff
+ import { useRouteState } from "react-stateshape";

  let App = () => {
-   let [{ coords }, setState] = useState({ coords: { x: 0, y: 0 } });
+   let [{ query }, setState] = useRouteState("/");

    let setPosition = () => {
      setState(state => ({
        ...state,
-       coords: {
+       query: {
          x: Math.random(),
          y: Math.random(),
        },
      });
    };

    return (
      <>
        <h1>Shape</h1>
-       <Shape x={coords.x} y={coords.y}/>
+       <Shape x={query.x} y={query.y}/>
        <p><button onClick={setPosition}>Move</button></p>
      </>
    );
  };
```

⬥ `useRouteState(url, options?)` has an optional second parameter in the shape of the `route.navigate()`'s options. Pass `{ scroll: "off" }` as `options` to opt out from the default scroll-to-the-top behavior when the URL changes.

⬥ See also the [Type-safe routes](#type-safe-routes) section.

## Type-safe routes

When it comes to accessing parameters extracted from a URL pattern, by default the parameters are typed as `Record<string, string | undefined>`, which quite literally represents a map containing portions of a string URL.

```tsx
let { at } = useRoute();

at(/^\/sections\/(?<id>\d+)\/?$/, ({ params }) => <Section id={params.id}/>)
                                  // ^ Record<string, string | undefined>

let [state, setState] = useRouteState("/");
  // ^ { query: Record<string, string | undefined> }
```

Optionally, more specific type-aware parsing of URL parameters can be achieved by replacing string and RegExp URL patterns with URL patterns produced by a schema-based URL builder, like with `url-shape` and `zod` or a [similar tool](https://standardschema.dev/schema#what-schema-libraries-implement-the-spec):

```ts
import { createURLBuilder } from "url-shape";
import { z } from "zod"; // Or another Standard Schema-compliant lib

// Get a type-aware URL builder `url()` based on a URL schema
export const url = createURLBuilder({
  "/sections/:id": z.object({
    // URL path placeholder parameters
    params: z.object({ id: z.coerce.number() }),
  }),
  "/": z.object({
    // URL query (or search) parameters
    query: z.optional(z.object({ x: z.coerce.number(), y: z.coerce.number() })),
  }),
});
```

The type-aware URL builder `url(pattern, options?)` provides hints about the types of the parsed URL parameters and helps avoid typos and type mismatches:

```tsx
let { at } = useRoute();

at(url("/sections/:id"), ({ params }) => <Section id={params.id}/>)
                         // ^ { id: number }

let [state, setState] = useRouteState(url("/"));
  // ^ { query: { x: number, y: number } | undefined }

<A href={url("/sections/:id", { id: 1 })}>Section 1</A>
                           // ^ { id: number }
```

The URL schema as shown above doesn't have to cover the entire app. This approach allows for incremental or partial adoption of type-safe routing, where needed.

On the other hand, once the entire app is covered with type-safe routes, we might want to avoid future use of relaxed typing with string and RegExp URL patterns. This can be achieved by adding the following type declaration that effectively disallows string and RegExp URL patterns:

```ts
declare module "react-stateshape" {
  interface URLConfig {
    strict: true;
  }
}
```

### Nested routes

All routes are handled independently, so type-safe nested routes don't require special handling and don't maintain implicit relations with their parent routes. It also means that nested routes don't inherit their parent route parameters by default. Relations between routes (also beyond the direct inheritance of parameters) can be pretty straightforwardly defined on the URL schema level without imposing implicit constraints, which could be hard to work around.

```ts
import { createURLBuilder } from "url-shape";
import { z } from "zod";

const sectionParams = z.object({
  sectionId: z.coerce.number(),
});

export const url = createURLBuilder({
  "/sections/:sectionId": z.object({
    params: sectionParams,
  }),
  "/sections/:sectionId/stories/:storyId": z.object({
    params: z.object({
      ...sectionParams.shape, // Shared URL parameters
      storyId: z.coerce.number(),
    }),
  }),
});
```

## useTransientState

Use this hook to track an async action's state, whether it's pending, successfully completed, or failed, without affecting the application's data management.

In the example below, storing and rendering the essential app data (`items`) and the happy path scenario remain unaffected. The loading and error state handling works like a decoupled scaffolding to the main scenario. (`items` are stored in local state here, but any other state used by the app can be there instead.)

```diff
+ import { useTransientState } from "react-stateshape";
- import { fetchItems } from "./fetchItems.js";
+ import { fetchItems as fetchItemsOriginal } from "./fetchItems.js";

  export let ItemList = () => {
    let [items, setItems] = useState([]);
+   let [state, fetchItems] = useTransientState("items", fetchItemsOriginal);

    useEffect(() => {
      // The fetched items can be stored with any approach to app state
      fetchItems().then(setItems);
    }, [fetchItems]);

+   if (state.initial || state.pending) return <p>Loading...</p>;
+   if (state.error) return <p>An error occurred</p>;

    return <ul>{items.map(/* ... */)}</ul>;
  };
```

```diff
+ import { useTransientState } from "react-stateshape";

- export let Status = ({ state }) => {
+ export let Status = () => {
+   let [state] = useTransientState("items");

    if (state.initial) return null;
    if (state.pending) return <>Busy</>;
    if (state.error) return <>Error</>;

    return <>OK</>;
  };
```

### Shared and local async action state

Use a string key with `useTransientState(key, action?)` to access the same action state from multiple components (as in `ItemList` and `Status` above). Pass `null` as the key to have the action state scoped locally to the component where the hook is used.

### Silent pending state

Use case: background actions or optimistic updates.

Set `{ silent: true }` as the last parameter of the trackable action returned from the `useTransientState` hook to prevent the `pending` property from switching to `true` in the pending state.

```js
let [state, fetchItems] = useTransientState(fetchItemsOriginal);
  // ^ `state.pending` remains `false` in the silent mode

fetchItems({ silent: true })
```

### Delayed pending state

Use case: Avoid flashing a process indicator when the action is likely to complete in a short while by delaying the pending state.

```js
let [state, fetchItems] = useTransientState(fetchItemsOriginal);
  // ^ `state.pending` remains `false` during the delay

fetchItems({ delay: 500 }) // in milliseconds
```

### Custom rejection handler

Allow the trackable action to reject explicitly with `{ throws: true }` as the last parameter, along with exposing `error` returned from `useTransientState` that goes by default.

```js
fetchItems({ throws: true }).catch(handleError)
```

### Action state provider

`<TransientStateProvider>` creates an isolated instance of initial shared async action state. Its prime use cases are SSR and tests. It isn't required with client-side rendering, but it can be used to separate action states of larger self-contained portions of an app.

```jsx
import { TransientStateProvider } from "react-stateshape";

<TransientStateProvider>
  <App/>
</TransientStateProvider>
```

Use the provider to set up a specific initial async action state when required:

```jsx
let initialState = {
  "fetch-items": { initial: false, pending: true },
};

<TransientStateProvider value={initialState}>
  <App/>
</TransientStateProvider>
```

⬥ With an explicit value or without, the `<TransientStateProvider>`'s nested components will only respond to updates in the particular action state they subscribed to by means of `useTransientState`.

## Annotated examples

Shared state

- [Shared state without Context](https://codesandbox.io/p/sandbox/gxkn85?file=%252Fsrc%252FApp.tsx), counter app, useExternalState
- [Shared state with Context](https://codesandbox.io/p/sandbox/9mpfsf?file=%252Fsrc%252FApp.tsx), counter app, useExternalState, React Context
- [Shared state with Immer](https://codesandbox.io/p/sandbox/gv4rgw?file=%252Fsrc%252FApp.tsx), counter app, useExternalState, Immer

Routing

- [URL-based rendering](https://codesandbox.io/p/sandbox/2nv8ck?file=%252Fsrc%252FApp.tsx), useRoute, link component
- [Type-safe URL-based rendering](https://codesandbox.io/p/sandbox/tltq5r?file=%252Fsrc%252FApp.tsx), useRoute, url-shape, zod
- [URL parameters as state](https://codesandbox.io/p/sandbox/6rp4sy?file=%252Fsrc%252FApp.tsx), useRouteState
- [Type-safe URL parameters as state](https://codesandbox.io/p/sandbox/6ck4qz?file=%252Fsrc%252FShapeSection.tsx), useRouteState, url-shape, zod
- [Type-safe nested routes](https://codesandbox.io/p/sandbox/pv9rgh?file=%252Fsrc%252FApp.tsx), useRoute, url-shape, zod
- [Unknown routes](https://codesandbox.io/p/sandbox/jnngqt?file=%252Fsrc%252FApp.tsx), useRoute
- [Lazy routes](https://codesandbox.io/p/sandbox/qw5r6g?file=%252Fsrc%252FApp.tsx), useRoute, React Suspense, React.lazy
- [View transitions](https://codesandbox.io/p/sandbox/w4q95n?file=%252Fsrc%252FApp.tsx), useRoute, View Transition API
- [Custom routing based on text input](https://codesandbox.io/p/sandbox/tykt44?file=%252Fsrc%252FApp.tsx), Route, RouteProvider, useRoute
- [Converting links in HTML content to SPA links](https://codesandbox.io/p/sandbox/7pfjc7?file=%252Fsrc%252FApp.tsx), useRouteLinks

Async action state

- [Shared async action state](https://codesandbox.io/p/sandbox/x9d2c9?file=%252Fsrc%252FItemList.tsx), useTransientState

Find also the code of these examples in the repo's [`tests`](https://github.com/axtk/react-stateshape/tree/main/tests) directory.

## Internals

[`stateshape`](https://www.npmjs.com/package/stateshape)
