# syntax=docker/dockerfile:1
# Production image: the Angular build served by unprivileged nginx, which also proxies
# /api and /actuator to the backend (the same routing vercel.json does on Vercel).

ARG NODE_VERSION=26.12.1

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine
LABEL org.opencontainers.image.title="Opposite of Boring frontend" \
      org.opencontainers.image.description="Angular 22 UI for Opposite of Boring, served by nginx" \
      org.opencontainers.image.source="https://github.com/soulwax/No-Boring-Frontend"
# Rendered by the image's entrypoint with envsubst, so BACKEND_URL is set at run time
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
ENV BACKEND_URL=http://backend:8080
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]
