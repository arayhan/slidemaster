import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>SlideMaster</h1>
      <p>Scaffolded and ready. Run <code>/bootstrap-project</code> in Claude Code to fill in PRODUCT.md, PRD.md, and DESIGN.md.</p>
      <p><Link to="/order">Order surfaces example</Link> · <Link to="/transaction">Transactions</Link></p>
    </main>
  );
}
