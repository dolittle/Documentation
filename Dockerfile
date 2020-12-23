FROM klakegg/hugo:ext-nodejs
WORKDIR /home/docsy/app
RUN mkdir -p /home/docsy/deps
COPY Source/package.json /home/docsy/deps/
# COPY Source/package-lock.json /home/docsy/deps/
RUN cd /home/docsy/deps/ && npm install -g
# COPY . .
COPY Source/ .
CMD [ "server", "-v" ]
