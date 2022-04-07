FROM docker-remote.artifacts.developer.gov.bc.ca/caddy:2.4.6-alpine

EXPOSE 2015
RUN echo $(ls)
RUN pwd
RUN cd .
RUN echo $(ls)
RUN pwd
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist /srv



