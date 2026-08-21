#!/bin/bash

PORT=$(cat .port) || PORT=1000

if [ $PORT -lt 1000 ] || [ $PORT -gt 9999 ]; then
  PORT=1000
fi

echo $(($PORT + 1)) > .port

./serve.py --port $PORT
