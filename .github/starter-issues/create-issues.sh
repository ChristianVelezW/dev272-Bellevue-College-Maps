#!/usr/bin/env bash
# Creates one GitHub issue per numbered .md file in this folder, then the
# develop branch. In each file, line 1 is the issue title and line 3 onward is
# the issue body.
set -euo pipefail
cd "$(dirname "$0")"

# Skip the course template itself. Repos generated from it are not templates.
is_template="$(gh api "repos/$REPO" --jq '.is_template')"
if [ "$is_template" = "true" ]; then
  echo "$REPO is a template repository. Skipping starter issues."
  exit 0
fi
echo "Creating starter issues in $REPO."

gh label create sprint-0 --repo "$REPO" --color 5319E7 \
  --description "Team kickoff work, due November 10" --force

existing="$(gh issue list --repo "$REPO" --state all --limit 200 \
  --json title --jq '.[].title')"

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

for file in [0-9]*.md; do
  title="$(head -n 1 "$file")"
  if printf '%s\n' "$existing" | grep -Fxq -- "$title"; then
    echo "Already exists: $title"
    continue
  fi
  tail -n +3 "$file" > "$body_file"
  gh issue create --repo "$REPO" --title "$title" --label sprint-0 \
    --body-file "$body_file"
done

# Branch from main so pull requests can go between develop and main.
if gh api "repos/$REPO/branches/develop" --silent 2>/dev/null; then
  echo "Already exists: develop"
else
  main_sha="$(gh api "repos/$REPO/git/ref/heads/main" --jq '.object.sha')"
  gh api "repos/$REPO/git/refs" -f ref=refs/heads/develop -f sha="$main_sha" \
    --silent
  echo "Created branch: develop"
fi
