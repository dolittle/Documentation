#!/bin/bash

docker build -t dolittle/documentation:latest .
docker push dolittle/documentation:latest

