#!/usr/bin/env bash
# Manual deploy from a laptop: build the static export and rsync it to the VPS.
# Usage: DEPLOY_TARGET=user@host:/var/www/kristijankresic.com npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."

: "${DEPLOY_TARGET:?Set DEPLOY_TARGET=user@host:/path/to/webroot}"

npm run build
rsync -az --delete out/ "$DEPLOY_TARGET/"
echo "Deployed to $DEPLOY_TARGET"
