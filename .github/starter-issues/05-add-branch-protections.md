Add branch protections

## Goal

Protect `main` and `develop` so that every change reaches them through a reviewed pull request. On GitHub's free plan, this only works on public repos. The person who created the repo follows these steps.

## Protect `main`

1. On GitHub, go to the main page of this repo.
2. Under the repo name, click **Settings**. If you can't see the tab, open the **...** menu, then click **Settings**.
3. In the **Code, planning, and automation** section of the sidebar, click **Branches**.
4. Under **Branch protection rules**, click **Add classic branch protection rule**.
5. Under **Branch name pattern**, type `main`.
6. Under **Protect matching branches**, select **Require a pull request before merging**.
7. Select **Require approvals**, and set the required number of approvals to **1**.
8. Select **Do not allow bypassing the above settings**. Without this, the repo owner can skip the rule.
9. Click **Create**.

## Protect `develop`

1. On the **Branches** settings page, click **Add classic branch protection rule**.
2. Under **Branch name pattern**, type `develop`.
3. Under **Protect matching branches**, select **Require a pull request before merging**.
4. Select **Require approvals**, and set the required number of approvals to **1**.
5. Select **Do not allow bypassing the above settings**.
6. Click **Create**.

## Acceptance criteria

- [ ] `main` has a branch protection rule that requires a pull request and one approving review.
- [ ] `develop` has a branch protection rule that requires a pull request and one approving review.
- [ ] Bypassing is not allowed on either rule.

## Where to look

- Canvas: [Team] GitHub Repository & Project Board Setup.
- GitHub Docs: [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- GitHub Docs: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
