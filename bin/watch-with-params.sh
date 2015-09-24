#!/usr/bin/env bash

# Determine script path & base path
SCRIPT_PATH="`dirname \"$0\"`" # relative
SCRIPT_PATH="`( cd \"${SCRIPT_PATH}\" && pwd )`" # absolutized and normalized
echo "SCRIPT_PATH: ${SCRIPT_PATH}"

BASE_PATH=${SCRIPT_PATH}/..
echo "BASE_PATH: ${BASE_PATH}"

cd ${BASE_PATH}

ENV=$1
PLATFORM=$2

NODE_ENV=${ENV} PLATFORM=${PLATFORM} gulp watch
