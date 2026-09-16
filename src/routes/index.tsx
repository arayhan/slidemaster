import { createFileRoute } from "@tanstack/react-router";

import { getLibrary } from "@/server/decks";

export const Route = createFileRoute("/")({
  // The loader runs on the server and hands the result to the component, so the
  // deck paths and the database never reach the browser bundle.
  loader: () => getLibrary(),
  component: Home,
});

function Home() {
  const { decks, skipped } = Route.useLoaderData();

  // Group in the render, not in SQL: the query is already ordered by topic, and
  // a personal library is tens of rows.
  const byTopic = new Map<string, typeof decks>();
  for (const deck of decks) {
    const existing = byTopic.get(deck.topic);
    if (existing) existing.push(deck);
    else byTopic.set(deck.topic, [deck]);
  }

  return (
    <main>
      <h1>SlideMaster</h1>

      {decks.length === 0 ? (
        <p>
          No decks indexed. Deck <code>.md</code> files live in <code>decks/</code>.
        </p>
      ) : (
        [...byTopic].map(([topic, group]) => (
          <section key={topic}>
            <h2>{topic}</h2>
            <ul>
              {group.map((deck) => (
                <li key={deck.id}>
                  <strong>{deck.title}</strong> <code>{deck.path}</code>
                  {deck.tags.length > 0 && <span> · {deck.tags.join(", ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {/* Skipped decks are surfaced, never swallowed — a deck the author
          expected to see and cannot find is the bug this prevents. */}
      {skipped.length > 0 && (
        <section>
          <h2>Not indexed ({skipped.length})</h2>
          <ul>
            {skipped.map((entry) => (
              <li key={entry.path}>
                <code>{entry.path}</code> — {entry.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
