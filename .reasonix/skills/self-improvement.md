---
name: self-improvement
description: Captures learnings, errors, and corrections to enable continuous improvement across sessions
---

# Self-Improvement Skill

Log learnings and errors to `.learnings/` files for continuous improvement. Review before major tasks.

## First-Use Initialisation

Ensure `.learnings/` directory and files exist. Run:
```bash
mkdir -p .learnings
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Command/operation fails | Log to `.learnings/ERRORS.md` |
| User corrects you | Log to `.learnings/LEARNINGS.md` with category `correction` |
| User wants missing feature | Log to `.learnings/FEATURE_REQUESTS.md` |
| API/external tool fails | Log to `.learnings/ERRORS.md` with integration details |
| Knowledge was outdated | Log to `.learnings/LEARNINGS.md` with category `knowledge_gap` |
| Found better approach | Log to `.learnings/LEARNINGS.md` with category `best_practice` |
| Similar to existing entry | Link with `**See Also**`, consider priority bump |
| Recurring pattern (≥3x) | Promote to project memory / AGENTS.md |

## Logging Format

### Learning Entry

Append to `.learnings/LEARNINGS.md`:
```markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config | electron

### Summary
One-line description

### Details
What happened, what was wrong, what's correct

### Suggested Action
Specific fix or improvement

### Metadata
- Source: conversation | error | user_feedback
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- Recurrence-Count: 1
```

### Error Entry

Append to `.learnings/ERRORS.md`:
```markdown
## [ERR-YYYYMMDD-XXX]

**Logged**: ISO-8601 timestamp
**Severity**: critical | major | minor
**Status**: pending | resolved | wont_fix

**Error**: Brief error description
**Context**: What was happening
**Cause**: Root cause
**Fix**: How to fix
```

### Feature Request Entry

Append to `.learnings/FEATURE_REQUESTS.md`:
```markdown
## [FR-YYYYMMDD-XXX]

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high

**Request**: Brief description
**Context**: Why it's needed
```

## Promotion Rules

When the same learning appears ≥3 times across ≥2 tasks:
1. Create permanent guidance in `project_memory.md` or `user_profile.md`
2. Mark original entries as `Status: promoted`
3. Add `**See Also**: promoted to project_memory.md`
