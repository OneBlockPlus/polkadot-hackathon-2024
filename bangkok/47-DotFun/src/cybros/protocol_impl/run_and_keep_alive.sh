#!/usr/bin/env sh

while true
do
   ./run.sh "$@"

   # show result
   exitcode=$?
   echo "exit code of command is $exitcode"

   sleep 1
done
