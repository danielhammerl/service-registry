ARG ARCH
FROM ${ARCH}node:lts-alpine

WORKDIR /root

RUN npm config set @danielhammerl:registry http://localhost:4873/
RUN npm config set //localhost:4873/:_auth UZ6bOTjYkJ4lJxz2Tn2XXw==

RUN npm config set fetch-timeout 100000
RUN npm config set fetch-retries 10

ENV NODE_ENV=production

COPY ./build ./

RUN --network=host npm ci --omit=dev --verbose --debug

ENTRYPOINT ["node", "index.js"]