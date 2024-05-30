const express = require("express");

const { getTopics } = require("./controllers/topics.controllers");
const { getApi } = require("./controllers/api.controllers");
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

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("*", endpointError);

app.use(customErrors);

app.use(pSQLErrors);

app.use(serverError);

module.exports = app;
