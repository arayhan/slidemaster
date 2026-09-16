// Shared business rules — bottom of the import graph, dependency-light.
// See docs/architecture.md#domain-sits-at-the-bottom before adding a dependency here.
export type { Deck, ParseInput, ParseResult, SkippedDeck } from "./deck";
export { REQUIRED_KEYS, parseDeck, slugFromPath } from "./deck";
