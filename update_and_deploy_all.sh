#!/bin/bash
git pull
git submodule update --recursive --remote
git commit -a -m "Updated docs"
git push