FROM node:18 AS runtime

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY . .

RUN npm install
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs --watch 