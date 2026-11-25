# 1. Start from a tiny, lightweight Linux + Node.js image (~50 MB)
FROM node:22-alpine
# 2. Set the working directory inside the container
WORKDIR /app
# 3. Copy package files FIRST (Senior Optimization: Layer Caching!)
COPY package*.json ./
# 4. Install ONLY production dependencies (skips nodemon & prettier)
RUN npm ci --omit=dev
# 5. Now copy the rest of your source code
COPY . .
# 6. Ensure Multer's temp folder exists inside the container
RUN mkdir -p public/temp
# 7. Document the port our Express app listens on
EXPOSE 8000
# 8. Start the production server when the container boots
CMD ["npm", "start"]