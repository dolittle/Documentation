FROM node:8

# Download and install hugo
ENV HUGO_VERSION 0.55.5
ENV HUGO_BINARY hugo_${HUGO_VERSION}_Linux-64bit.deb

ADD https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_BINARY} /tmp/hugo.deb
RUN dpkg -i /tmp/hugo.deb \
	&& rm /tmp/hugo.deb

WORKDIR /app
ADD package.json package.json
ADD themes/docdock themes/docdock

RUN npm install

RUN mkdir repositories
ADD content content

ADD repositories.json repositories.json
ADD build.js build.js
ADD helpers.js helpers.js
ADD globals.js globals.js
ADD versioning.js versioning.js
ADD BuildVersion.js BuildVersion.js
ADD config.toml config.toml


RUN ./build.js


ADD . .

CMD ./build.js && node app.js