FROM node:12-alpine
RUN apk update && apk upgrade && apk add openssl && apk add --no-cache bash
WORKDIR /srv/app
COPY . .
EXPOSE 3000 3001 5000 5001

CMD ["node", "--use-strict", "index.js"]