#!/bin/sh
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

browserify -t debowerify -t deamdify ${SCRIPT_DIR}/../web/src/scripts/app.js -o ${SCRIPT_DIR}/../web/public/js/bundle.js