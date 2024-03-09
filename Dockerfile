# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1

FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /home/node/gpxtracks
# Copy everything except the files in .dockerignore
COPY . .

RUN npm ci
RUN npm run build:ui


FROM node:${NODE_VERSION}-alpine as runner
LABEL maintainer="stefan.roeck@gmail.com"
WORKDIR /home/node/gpxtracks

# Use production node environment by default.
ENV NODE_ENV production

# Copy everything except the files in .dockerignore
COPY . .
# Copy build artifacts from the previous stage.
COPY --from=builder /home/node/gpxtracks/dist /home/node/gpxtracks/dist
# Only install production dependencies.
RUN npm ci --omit=dev

# Run the application as a non-root user.
USER node
# Expose the port that the application listens on.
EXPOSE 3000
# Run the application.
CMD npm run server
