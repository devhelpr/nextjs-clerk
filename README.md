# Project info

This is a Test project to see how well you can create an application with some CRUD functionality with relations between entities using Cursor.com, Nextjs, Supabase/PostgreSql and Clerk.

How is this project created?

- This project was bootstrapped with [Next.js](https://nextjs.org) [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
- clerk.com is used for authentication using their default instructions
- Cursor.com was used to bootstrap the project further with my instructions
- Supabase postgreSql is used to store the data, database schema was created using chatgpt and manually enhanced
- While bootstrapping the project with Cursor.com, lots of manual work was done to make the project work as expected. Mainly in the route api's when dealing with the sql statements for communication with the database.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Prisma

after making changes to schema.prisma, run the following commands to update the database schema

```bash
prisma migrate dev --name ...
```
... is the name of the migration

run the following command to generate the prisma client

```bash
prisma generate
```