#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

dart --checked --package-root=${SCRIPT_DIR}/../packages ${SCRIPT_DIR}/../src/bin/web.dart