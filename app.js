const express = require("express");
const {
  endpointError,
  customErrors,
  pSQLErrors,
  serverError,
} = require("./controllers/errorHandling.controllers");
const apiRouter = require("./routes/api-router");
const topicsRouter = require("./routes/topics-router");
const articlesRouter = require("./routes/articles-router");
const commentsRouter = require("./routes/comments-router");
const usersRouter = require("./routes/users-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter)

app.use("/api/topics", topicsRouter)

app.use("/api/articles", articlesRouter)

app.use("/api/comments", commentsRouter)

app.use("/api/users", usersRouter)

app.all("*", endpointError);

app.use(customErrors);

app.use(pSQLErrors);

app.use(serverError);

module.exports = app;
