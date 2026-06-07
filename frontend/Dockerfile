FROM node:24-bullseye

WORKDIR /frontend

# Install dependencies first for better Docker cache
COPY package*.json ./
RUN npm install

# Copy source files
COPY ./public ./public
COPY ./src ./src
COPY eslint.config.js ./
COPY index.html ./
COPY vite.config.js ./

RUN npm install react-bootstrap bootstrap styled-components axios react-router-dom react-easy-crop uuid

EXPOSE 5173

CMD ["npm", "run", "dev"]