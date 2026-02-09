FROM node:20-alpine

WORKDIR /app

# نسخ ملفات الاعتماديات
COPY package*.json ./
COPY prisma ./prisma/

# تثبيت الاعتماديات
RUN npm install

# إنشاء Prisma Client
RUN npx prisma generate

# نسخ باقي الملفات
COPY . .

# إنشاء مجلد uploads
RUN mkdir -p uploads/membership

EXPOSE 3013

CMD ["node", "index.js"]
