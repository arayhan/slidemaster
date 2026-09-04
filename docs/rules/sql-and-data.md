# SQL and data

## Migrations

`db/migrations/` is run **manually**. No code may assume a migration has been
applied — not at import time, not on first request, not "it must have been by
now". Code that reads a column added last week and crashes on an environment
nobody migrated is the most common version of this bug.

- **Forward-only.** A migration that has been applied anywhere is never edited.
  Fix it with a new migration; editing one leaves every environment that already
  ran it silently different from the file.
- **One migration, one change.** Reversible where it can be. A migration that adds
  a table, backfills it, and drops a column has three ways to fail halfway.
- **Destructive changes are two deploys, not one.** Add the new column, ship code
  that writes both, backfill, ship code that reads the new one, *then* drop the
  old. Dropping in the same deploy that stops using it takes the old code down
  with it during the rollout window.
- Name them so the order is obvious from `ls`, and never renumber.

## Queries

- **Parameterised only.** String interpolation into SQL is never acceptable,
  including for an internal admin query nobody outside will call. See
  [security.md](./security.md).
- **Name your columns.** `SELECT *` returns whatever the schema happens to hold
  today, so a column added later silently widens every payload and can leak a
  field the endpoint was never meant to expose.
- **N+1 is the default failure of any ORM**, not an edge case. A loop that touches
  a relation issues one query per iteration. Load the relation in one query, or
  batch. This is invisible with ten rows in development and fatal with ten
  thousand in production.
- **Every list query has a limit.** No exceptions for "this table is small".
- **Filter and sort in the database**, not in application code after fetching
  everything. The database has indexes; your `Array.filter` does not.

## Transactions

Anything that writes more than one row and must be all-or-nothing runs in a
transaction. A "create the order, then decrement the stock" pair that is not
transactional will eventually leave an order with no stock movement, and you will
find it from a customer email rather than a log.

Keep transactions short. Never hold one open across a network call to a third
party — a slow API turns into a lock nobody can explain.

## Indexes

Each index is a deliberate decision, and the query that justifies it is recorded
in the migration that adds it. An index nobody can name a query for is write cost
with no read benefit; a foreign key with no index is the table scan you will find
under load.

Read the query plan before adding one, and again after. "It looked like it needed
an index" is not evidence.

## Time and money

- Store timestamps in UTC. Convert at the edge, on the way out.
- Store money in the smallest unit as an integer, never a float. `0.1 + 0.2` is
  the reason.

## This project's data layer

TODO(content) — the database and version, the access layer (raw SQL, query
builder, or ORM, and which), the table and column naming convention, and how
migrations are actually run in each environment.
