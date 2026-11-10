# UVF — United Volunteer's Foundation

A starter full-stack rebuild of the public UVF site. This is an independent implementation, not an extraction of Base44's private source code.

## Stack
- Client: React + Vite
- API: Node.js + Express
- Database: PostgreSQL + Prisma

## Quick start
1. Install Node.js 20+ and PostgreSQL.
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and a long `JWT_SECRET`.
3. In `server/`: `npm install`, `npx prisma generate`, `npx prisma migrate dev --name init`, `npm run dev`.
4. In `client/`: `npm install`, `npm run dev`.
5. Client runs at http://localhost:5173; API at http://localhost:4000.

## Important before production
- Create the first administrator through a controlled seed/invite process; do not expose public admin registration.
- Configure email/SMS verification, rate limiting, backups, HTTPS, logging, and privacy/consent notices.
- Review all blood-request and donor data handling against applicable local laws and obtain consent.
- This starter does not connect to or copy the existing Base44 database.
