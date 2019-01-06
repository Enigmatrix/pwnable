FROM ubuntu:latest

EXPOSE 6969
RUN apt-get update -y
RUN apt-get install -y gdb socat
COPY ./ /srv/
WORKDIR /srv