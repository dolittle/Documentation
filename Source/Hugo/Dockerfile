FROM node:8

###############################################################################
# This section is on a Dockerfile for Hugo
# https://github.com/publysher/docker-hugo/blob/master/Dockerfile
###############################################################################
# Download and install hugo
ENV HUGO_VERSION 0.47.1
ENV HUGO_BINARY hugo_${HUGO_VERSION}_Linux-64bit.deb

ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY} /tmp/hugo.deb
RUN dpkg -i /tmp/hugo.deb \
	&& rm /tmp/hugo.deb

WORKDIR /app
ADD package.json package.json
ADD themes/docdock themes/docdock

RUN npm install

RUN mkdir repositories
RUN mkdir content

ADD build.js build.js
ADD helpers.js helpers.js
ADD globals.js globals.js
ADD versioning.js versioning.js
ADD BuildVersion.js BuildVersion.js
ADD repositories.json repositories.json
ADD config.toml config.toml


RUN ./build.js


ADD . .

CMD ./build.js && node app.js