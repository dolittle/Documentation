FROM node:8

ARG repository=https://www.vg.no
VOLUME "/hugo/repositories"

#ADD sources.list /etc/apt/sources.list

RUN apt-get update &&\
    apt-get install software-properties-common python-software-properties

#RUN apt-get update &&\
#    apt-get install hugo

#WORKDIR /hugo
#ADD . .

#ENTRYPOINT "node ./build.js https://github.com/dolittle/runtime.git"
