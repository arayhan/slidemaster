import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>SlideMaster</h1>
      <p>
        Walking skeleton. The deck library, editor preview, and present mode
        arrive in Phase 1b — see <code>docs/STATE.md</code> for where the
        project is right now.
      </p>
    </main>
  );
}
