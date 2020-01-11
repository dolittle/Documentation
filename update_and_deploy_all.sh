#!/bin/bash
git pull
git pull --recurse-submodules --jobs=10
git commit -a -m "Updated docs"
git push