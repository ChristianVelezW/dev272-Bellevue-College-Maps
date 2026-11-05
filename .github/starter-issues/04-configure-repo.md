Configure the repository

## Goal

Set up the repo once so the team can work in it for the next five weeks. The person who created the repo changes the default branch, because that takes admin access.

## Make `develop` the default branch

This repo already has a `develop` branch, so pull requests can target it as soon as it's the default.

1. On GitHub, go to the main page of this repo.
2. Under the repo name, click **Settings**. If you can't see the tab, open the **...** menu, then click **Settings**.
3. Under **Default branch**, to the right of the branch name, click the **Switch to another branch** icon.
4. Open the branch dropdown menu and click `develop`.
5. Click **Update**.
6. Read the warning, then click **I understand, update the default branch**.

## Acceptance criteria

- [ ] `develop` is the default branch.
- [ ] The repo is public, or private with an owner on a paid GitHub plan.
- [ ] `package.json` `name` and `description`, and `app.json` `name` and `slug`, are set to your app.
- [ ] `/retrospectives` (with a `.gitkeep`) and `/wireframes` exist.
- [ ] The AI instruction files are in place and unedited.
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm exec tsc --noEmit`, and `pnpm test` all pass.

## Where to look

- Canvas: [Team] GitHub Repository & Project Board Setup.
- GitHub Docs: [Changing the default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch)
