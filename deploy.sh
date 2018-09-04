#!/usr/bin/env bash

BIRed='\033[1;91m'
BIGreen='\033[1;92m'
BIBlue='\033[1;94m'
BIYellow='\033[1;93m'
UYellow='\033[4;33m'

function messageTxt {
    echo -e "$1--------------------------\n$message\n--------------------------\n"
}

git status

yarn version --patch
message="Bump version for application success"
messageTxt ${BIGreen}

git add -A
message="Git add all file in project success"
messageTxt ${BIBlue}

commit=$(curl -s whatthecommit.com/index.txt);
git commit -m "${commit}"
message="Commit: ${BIYellow}${commit}"
messageTxt ${UYellow}

git push origin