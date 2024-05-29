const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const selectCommentsAndArticles = [
    selectCommentsByArticleId(article_id),
    selectArticleById(article_id),
  ];
  return Promise.all(selectCommentsAndArticles)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
