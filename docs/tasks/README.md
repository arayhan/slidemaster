# docs/tasks/

Work orders, one file per unit of work. Two kinds live here and they are not interchangeable:
a **step** is something an agent does, a **gate** is something a human decides.

## Naming

`<phase>-<kind>-<slug>.md`

```
1a-step-01-architecture.md
1a-step-02-scaffold.md
…
1b-gate-client.md
1b-step-01-art-direction.md
2-gate-client.md
```

The folder sorts into build order on its own, so no index needs maintaining, and the filename
says who acts before anyone opens it.

**Step files land when their phase's build actually starts**, not during planning. Gates land as
soon as the questions exist, because a gate whose questions are written late is a gate that gets
held late — and stakeholder response time is often the longest lead item in a project.

## Steps

State a goal, a concrete deliverables list, and **acceptance criteria written as runnable checks**
— grep patterns, commands, assertions — not vague prose. Include `**Depends**:` / `**Blocks**:`
lines and end with a `handoff:` line naming the next agent.

A well-formed step is specific enough that someone with no conversation context can execute it
and know when they are done. If you cannot write its acceptance criteria as a command, the task is
not specified yet — say so rather than writing prose that sounds like a check.

Before writing a step file, **check whether its work is already done**. Planning often completes
tasks incidentally while their Definition-of-Done boxes stay unticked, and an agent working the
spec as a task list will rebuild them.

## Gates

A gate names **who decides**, **what it unblocks**, the questions that must not be left unasked,
and a sign-off block with room for the outcome. It carries a `**Blocks**:` line like a step.

It deliberately does **not** carry runnable acceptance criteria or a `handoff:` agent line. Its
acceptance criterion is a human signature and no agent picks it up; forcing it into the step
shape would mean writing checks that cannot be run.

Fill a gate in **during or immediately after** the meeting, not from memory afterwards. The
outcome is the durable half — a gate with blank answers is a meeting that has not happened yet,
whatever the calendar says.
