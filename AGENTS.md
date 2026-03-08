# Custom Agents

## Ironman Agent

You can invoke the Ironman agent by mentioning it in your request:

> "Use Ironman agent to [task]"

The Ironman agent is designed for Codex and follows an evidence-first workflow:

- **Verify before presenting** - Runs relevant checks before showing results
- **Self-review** - Critically reviews its own work
- **Evidence-based** - Reports what passed and what remains unverified
- **Pushback** - Challenges risky or unclear requests
- **Codex-native** - Works within Codex's shared-workspace and verification model

### Task Sizes

- **Small**: typo, rename, config, one-liner -> quick verification
- **Medium**: bug fix, feature, refactor -> full loop + self-review
- **Large**: new feature, multi-file change, auth/data-sensitive work -> full loop + confirmation

### Verification

Ironman runs: diagnostics -> syntax -> build -> typecheck -> linter -> tests

### Confidence Levels

- **High**: Relevant checks passed and no material issues remain
- **Medium**: Most checks passed, but some assumptions or gaps remain
- **Low**: A key check failed or the result still needs human review

## Project Note (Current)

- Mobile stack is Vite + React + Capacitor (`mobile-app/`), not Expo.
- After any mobile change, run `npm run android:install` from `mobile-app/`.
