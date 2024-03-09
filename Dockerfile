# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-alpine
LABEL maintainer="stefan.roeck@gmail.com"

WORKDIR /home/node/gpxtracks
# Copy everything except the files in .dockerignore
COPY . .

RUN npm ci
RUN npm run build

# Use production node environment by default.
ENV NODE_ENV production
# Run the application as a non-root user.
USER node
# Expose the port that the application listens on.
EXPOSE 3000
# Run the application.
CMD npm run server
