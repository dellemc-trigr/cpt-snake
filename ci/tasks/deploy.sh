#!/usr/bin/env bash

set -e -x

check_param CF_IP
check_param CF_ENDPOINT
check_param CF_USERNAME
check_param CF_PASSWORD
check_param CF_ORG
check_param CF_SPACE

curl -L "https://cli.run.pivotal.io/stable?release=linux64-binary&source=github" | tar -zx
export PATH=${PWD}:$PATH

cd cpt-snake/

cf api "https://api.${CF_ENDPOINT}" --skip-ssl-validation
cf auth $CF_USERNAME "$CF_PASSWORD"
cf target -o $CF_ORG -s $CF_SPACE
cf push dojo-snake-acceptance
