# Yantra web app: a static site served by a tiny Node server (no npm dependencies).
FROM node:22-alpine

WORKDIR /app

# Only copy what the site needs. server.js serves frontend files, so keep it lean.
COPY backend/ ./backend/
COPY frontend/ ./frontend/

ENV HOST=0.0.0.0 \
    PORT=5500 \
    NODE_ENV=production

EXPOSE 5500

# Run as the unprivileged "node" user that ships with the image.
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5500/healthz || exit 1

CMD ["node", "backend/server.js"]
