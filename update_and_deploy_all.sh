#!/bin/bash
git pull
git submodule update --recursive --remote
git add .
git commit -m "Updated docs"
git push