FROM artifacts.developer.gov.bc.ca/docker-remote/node:18.16.0-alpine3.18

RUN chown -R 1010:1010 "/.npm"
RUN npm cache clean --force
RUN mkdir -p /logs
RUN chmod 755 /logs

WORKDIR /opt/app-root/src
RUN ln -s /logs .

COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
EXPOSE 443 8080
CMD ["npm", "start"]
