#!/usr/bin/env bash

# Determine script path & base path
SCRIPT_PATH="`dirname \"$0\"`" # relative
SCRIPT_PATH="`( cd \"${SCRIPT_PATH}\" && pwd )`" # absolutized and normalized
echo "SCRIPT_PATH: ${SCRIPT_PATH}"

BASE_PATH=${SCRIPT_PATH}/..
echo "BASE_PATH: ${BASE_PATH}"

cd ${BASE_PATH}

DEBUG=* node .
