import type { LocationValue } from "bridgestate";

export type EnhanceHref<T extends { href?: string | undefined }> = Omit<
  T,
  "href"
> & {
  href?: LocationValue;
};
