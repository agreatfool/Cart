#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${SCRIPT_DIR}

find . -type l -name 'packages' -delete

export NODE_ENV=development
gulp $1