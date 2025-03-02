# Project info

This is a Test project to see how well you can create an application with some CRUD functionality with relations between entities using Cursor.com, Nextjs, Supabase/PostgreSql and Clerk.

How is this project created?

- This project was bootstrapped with [Next.js](https://nextjs.org) [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
- clerk.com is used for authentication using their default instructions
- Cursor.com was used to bootstrap the project further with my instructions
- Supabase postgreSql is used to store the data, database schema was created using chatgpt and manually enhanced
- While bootstrapping the project with Cursor.com, lots of manual work was done to make the project work as expected. Mainly in the route api's when dealing with the sql statements for communication with the database.
- I am now migrating the project to use Prisma to make the project more maintainable and easier to work with... using Cursor.
- splitting up the Table component in a atomic design way to make the project more maintainable and easier to work with... multiple components were created but multiple prompts were neaded to get it to work (especially the editting of rows)
- still often errors happened and were only found during build... cursor could fix it by copy & pasting the errors in composer.
- Agent mode is a big improvement , especially when commands needed to be executed for example when directories needed to be created , files needed to be copied or npm commands needed to be executed.

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


create a new migration without running:

npx prisma migrate dev --create-only