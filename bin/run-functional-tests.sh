#!/bin/bash
set -ex

ADDITIONAL_COMPOSE_FILE=docker-compose.functional-tests.yml

function shutdownDocker() {
  docker-compose -f ${ADDITIONAL_COMPOSE_FILE} down
}

export CLAIM_STORE_URL=$(echo ${TEST_URL} | sed -e "s/legal-frontend/claim-store/" -e "s/-staging//" -e "s/https/http/")
export IDAM_URL=http://betaDevBccidamAppLB.reform.hmcts.net

trap shutdownDocker INT TERM QUIT EXIT

docker-compose --version

if [[ "${1}" != "--no-pull" ]]; then
  docker-compose -f ${ADDITIONAL_COMPOSE_FILE} pull
fi
docker-compose -f ${ADDITIONAL_COMPOSE_FILE} up --no-color -d remote-webdriver
docker-compose -f ${ADDITIONAL_COMPOSE_FILE} run legal-integration-tests
docker-compose -f ${ADDITIONAL_COMPOSE_FILE} down
