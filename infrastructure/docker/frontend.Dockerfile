# --- Stage 1: Build Static Assets ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency mappings
COPY frontend/package*.json ./
RUN npm ci

# Copy source code and build Vite bundle
COPY frontend/ .
RUN npm run build

# --- Stage 2: Serve static assets via Nginx ---
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Clean default assets and copy production build
RUN rm -rf ./*
COPY --from=build /app/dist .

# Insert a custom Nginx configuration to support SPA routing fallback to index.html
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
