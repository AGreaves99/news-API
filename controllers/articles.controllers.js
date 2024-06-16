const {
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
  insertArticle,
} = require("../models/articles.models");
const { checkExists } = require("../models/shared.models");

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  const articlesAndQuery = [selectArticles(topic, sort_by, order, limit, p)];
  // console.log(articlesAndQuery);
  if (topic) {
    articlesAndQuery.push(checkExists("topics", "slug", topic));
  }
  return Promise.all(articlesAndQuery)
    .then(([countAndArticles]) => {
      const {total_count} = countAndArticles[0][0]
      const articles = countAndArticles[1]
      res.status(200).send({ total_count, articles });
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

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  insertComment([article_id, username, body])
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticle([inc_votes, article_id])
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const { title, topic, author, body, article_img_url } = req.body;
  insertArticle([title, topic, author, body, article_img_url])
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
