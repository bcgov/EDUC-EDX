FROM docker-remote.artifacts.developer.gov.bc.ca/caddy:2.4.6-alpine

EXPOSE 2015
RUN pwd
RUN echo $(ls -l)
RUN cd ..
RUN echo $(ls -l)
RUN pwd
COPY Caddyfile /etc/caddy/Caddyfile
COPY /dist /srv



