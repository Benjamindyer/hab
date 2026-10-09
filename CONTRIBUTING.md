# Contributing to HAB

Thank you for helping. HAB is early, so the most useful things right now are bug reports with detail, testing on real tablets, and small focused pull requests.

## Before you start

- Read `docs/SPEC.md` (what HAB is for) and `docs/ARCHITECTURE.md` (how the code is organised).
- For anything bigger than a bug fix, open an issue first so we agree on the approach.

## Setting up

```bash
cd app
npm install
npm run dev
npm run check     # type check, lint and tests. Must pass.
```

Integration tests (Python 3.13): `pip install -r requirements-test.txt && pytest tests`.

## Rules the code follows

- TypeScript in strict mode. Files under 250 lines, functions under 50. The linter enforces this, and a pull request that breaks it will fail CI.
- Each module has one job. Scenes depend on small interfaces, not on the Home Assistant connection.
- New logic comes with tests. Logic belongs in `app/src/state/`, where it needs no browser and no Home Assistant.
- Use public Home Assistant interfaces only. Anything private must be isolated in one place and tested.
- No secrets, tokens, real addresses or personal entity ids in the repository. Settings files are ignored by git for that reason.
- Original work only. HAB is written from Home Assistant's public interfaces. Do not copy code from other projects unless its licence allows it and the pull request says so.

## Pull requests

Keep them small. Describe what changed and how you tested it. Say plainly what you did not test.

## Licence

By contributing you agree that your contribution is licensed under the Apache License 2.0.
