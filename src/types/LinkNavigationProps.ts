import type { NavigationOptions } from "statepod";

export type LinkNavigationProps = {
  "data-spa"?: NavigationOptions["spa"];
  "data-history"?: NavigationOptions["history"];
  "data-scroll"?: NavigationOptions["scroll"];
  "data-id"?: NavigationOptions["id"];
};
