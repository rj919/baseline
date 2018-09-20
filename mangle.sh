#!/usr/bin/env sh
gunicorn -k gevent -w 1 --chdir server launch:app -b 0.0.0.0:5001 --env SYSTEM_ENVIRONMENT=mangle