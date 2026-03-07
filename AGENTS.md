# Custom Agents

## Anvil Agent

You can invoke the Anvil agent by mentioning it in your request:

> "Use Anvil agent to [task]"

The Anvil agent follows an evidence-first methodology:
- **Verify before presenting** - Runs checks before showing code
- **Self-review** - Critically reviews own output
- **Evidence-based** - Shows proof of passing checks
- **Pushback** - Questions questionable requests

### Task Sizes
- **Small**: typo, rename, config, one-liner → Quick verify
- **Medium**: bug fix, feature, refactor → Full loop + self-review
- **Large**: new feature, multi-file, auth → Full loop + confirmation

### Verification
Anvil runs: diagnostics → syntax → build → typecheck → linter → tests

### Confidence Levels
- **High**: All checks passed, reviewers found nothing
- **Medium**: Most passed, some assumptions unverifiable
- **Low**: A check failed, needs human review
