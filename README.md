# Northcoders News API

## Description

This project handles the creation of the backend API for a news/article application. Included are files for database seeding and MVC for dealing with CRUD operations at each endpoint.

For a description of each endpoint, please see the `endpoints.json` file or you can view it online here: [link to API](https://news-api-q4xk.onrender.com/api/)

## Setup Instructions:

1. Ensure Node.js (^v21.6.1) and Postgres (^v14.11) are installed
2. With pSQL, make sure you have correctly set up a user and password that you can use for connecting to your database
   - see node-postgres documentation for help with this
3. Clone this GitHub repo
4. Run `npm i` from the root directory of the repo to install dependencies
5. Create the following additional files with a `PGDATABASE` enviroment variable in the project directory:
   - .env.development
   - .env.test
   - See `.env-example` if you need more help with this

### Seeding:

1. To create the database, run `npm run setup-dbs` - this and following scripts should be in the `package.json`
2. Run `npm run seed` to seed the dev database

### Testing:

- To run tests, run `npm test`

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
