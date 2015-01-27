#!/bin/sh

##
#  Progressio
#  Deployment script
#
#  Copyright 2014, Valérian Saliou
#  Author: Valérian Saliou https://valeriansaliou.name/
##

ABSPATH=$(cd "$(dirname "$0")"; pwd)
BASE_DIR="$ABSPATH/../"

# Fixes issues
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

echo "Deploying Progressio..."

cd "$BASE_DIR"

npm install && grunt build
rc=$?

# Check for errors
if [ $rc = 0 ]; then
  echo "Done."
else
  echo "Error."
fi

exit $rc
