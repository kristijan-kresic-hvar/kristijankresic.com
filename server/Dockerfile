# The contact service as a container (DigitalOcean App Platform builds this): Node and one file, nothing from npm.
FROM node:22-alpine
WORKDIR /app
COPY contact.mjs .
USER node
CMD ["node", "contact.mjs"]
