import type { LocationValue } from "statepod";

export type EnhanceHref<T extends { href?: string | undefined }> = Omit<
  T,
  "href"
> & {
  href?: LocationValue;
};
