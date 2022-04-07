FROM docker-remote.artifacts.developer.gov.bc.ca/node:14.19.1 as build-stage
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM docker-remote.artifacts.developer.gov.bc.ca/caddy:2.4.6-alpine as caddy-stage

EXPOSE 2015
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /frontend/dist /srv
