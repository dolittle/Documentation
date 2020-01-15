# For building a local Hugo environent to locally test your chnages to documentation
FROM ubuntu:latest

RUN apt-get update && \
    apt-get install git wget -y

# https://discourse.gohugo.io/t/clever-link-to-latest-hugo-version-download/12178/5
RUN wget https://github.com`wget -qO- https://github.com/gohugoio/hugo/releases/latest | grep -oE -m 1 '\/gohugoio\/hugo\/releases\/download\/v[0-9]+.[0-9]+.[0-9]*\/hugo_[0-9]+.[0-9]+.[0-9]*_Linux-64bit.deb'`
RUN dpkg -i hugo_*

COPY . /Documentation

WORKDIR /Documentation/Source

# otherwise can't connect to localhost
CMD hugo server --bind "0.0.0.0"

