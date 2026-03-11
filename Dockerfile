FROM node:18-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# This handles React Router redirects (avoids 404 on refresh)
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]