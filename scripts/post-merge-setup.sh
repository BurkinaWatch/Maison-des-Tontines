#!/usr/bin/env bash
set -euo pipefail

npm install --no-audit --ignore-scripts
npm exec --workspace=@maison-des-tontines/api prisma generate