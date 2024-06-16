const express = require("express");

const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postComment,
  patchArticle,
} = require("./controllers/articles.controllers");
const {
  endpointError,
  customErrors,
  pSQLErrors,
  serverError,
} = require("./controllers/errorHandling.controllers");
const { deleteComment } = require("./controllers/comments.controllers");
const { getUsers } = require("./controllers/users.controllers");
const apiRouter = require("./routes/api-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter)

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers)

app.all("*", endpointError);

app.use(customErrors);

app.use(pSQLErrors);

app.use(serverError);

module.exports = app;
