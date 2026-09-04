# SessionStart hook - injects the project's non-negotiable traps into context.
#
# Why this exists: .claude/skills/project-gotchas/SKILL.md says "every agent must load
# this once per session before touching source files." That was honor-system, and an
# honor-system rule is one nobody notices being skipped. This makes it guaranteed.
#
# Deliberately a SUMMARY, not the whole skill. It is the trap list plus a pointer;
# anything needing full context still reads the skill and the docs. Keeping it short
# means it stays cheap enough to fire on every session without bloating context.
#
# Output on stdout becomes additionalContext. Exit 0 always - a broken hook must never
# block a session from starting.

$ErrorActionPreference = 'Stop'

try {
    # EDIT THIS LIST. It is injected into every session before any work starts, so it
    # must stay short - it is the trap list, not the spec. Anything needing full
    # context reads the skill and the docs it points at.
    #
    # What belongs here: rules an agent CANNOT infer from the code, where breaking one
    # costs rework rather than a lint error. The project this scaffold came from had
    # eight lines covering a concurrency invariant, a content prohibition, a
    # placeholder convention, and a build-output trap.
    #
    # ASCII only. PowerShell 5.1 reads BOM-less files as ANSI and non-ASCII breaks the
    # parser - this bit once already.
    $lines = @(
        'SlideMaster - non-negotiable traps (full detail: .claude/skills/project-gotchas, docs/PRD.md, docs/architecture.md)',
        'CODING RULES: docs/rules/ - read the file for what you are touching before you write it.',
        'COMMITS: atomic, semantic subject, body saying WHY. Never a Co-Authored-By or agent footer.',
        '',
        'STACK: TanStack Start, TypeScript, pnpm.',
        'ONE PACKAGE MANAGER: pnpm only. Never commit a lockfile from a different one.',
        '',
        'TODO: phases, and which are committed vs deferred.',
        'TODO: the single most expensive bug in this project, and the invariant that prevents it.',
        'TODO: content rules - what must never appear in the UI, what must be verbatim.',
        'TODO: placeholder marker convention, and the complete list of categories.',
        'TODO: any trap that fails SILENTLY. Those are the ones worth the context budget.',
        '',
        'COMMENTS: explain WHY, never WHAT. If it restates the line below it, delete it. Rename instead of annotating.',
        'VERIFICATION: run the command, quote the decisive output line, then claim done. Never assert without evidence.',
        'Append to docs/PROGRESS.md after every completed task.',
        '',
        'ONE WRITING SESSION PER WORKTREE. Two sessions editing one repo ship defects neither can see.',
        'Commit before handing off. Splitting work across worktrees: docs/rules/git-workflow.md - split by MODULE, never by layer.'
    )

    $lines -join "`n" | Write-Output

    # Record the session's starting commit so the Stop hook can diff against it.
    # Without this the Stop check only sees the working tree, which is empty by the
    # time a turn ends under this project's commit-after-every-step convention -
    # so it never fired once across an entire session. Both marker files are
    # gitignored and their absence is handled: the Stop hook degrades to a
    # working-tree check rather than erroring.
    try {
        Push-Location -Path $PSScriptRoot
        try {
            Set-Location (Join-Path $PSScriptRoot '..\..')
            $head = (& git rev-parse HEAD 2>$null)
            if ($LASTEXITCODE -eq 0 -and $head) {
                Set-Content -Path '.claude/.session-head' -Value $head.Trim() -Encoding ascii
            }
            # A new session gets a fresh nudge budget.
            Remove-Item -Path '.claude/.claudemd-nudged' -ErrorAction SilentlyContinue
        }
        finally { Pop-Location }
    }
    catch {
        # A missing marker is not a reason to fail the injection.
    }
}
catch {
    # Never block a session over a context-injection failure.
}

exit 0
