#!/usr/bin/env bash

git status

yarn version --patch

git add -A

git commit -m "$(curl -s whatthecommit.com/index.txt)"

git push origin




