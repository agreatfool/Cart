#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${SCRIPT_DIR}

pub install

find . -type l -name 'packages' -delete
