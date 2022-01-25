#!/bin/bash
path=$(dirname "$0")
cd "$path/.."
jsdoc . -c ./docs/conf.json
# read to 1 char to pause
read -n1 -r -p "Press any key to continue..." key