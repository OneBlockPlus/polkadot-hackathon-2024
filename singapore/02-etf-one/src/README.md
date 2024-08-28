This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, start Database
```bash
docker-compose up
```
Second, migrate database
```shell
pnpm i
pnpm migrate:latest
```
Second, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) 