FROM docker-remote.artifacts.developer.gov.bc.ca/caddy:2.4.6-alpine

EXPOSE 2015
RUN echo $(ls)
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist /srv



