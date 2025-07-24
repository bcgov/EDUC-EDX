FROM artifacts.developer.gov.bc.ca/docker-remote/node:22.17.1-alpine3.22 AS build-stage
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM artifacts.developer.gov.bc.ca/docker-remote/caddy:2.4.6-alpine AS caddy-stage

EXPOSE 2015
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /frontend/dist /srv
