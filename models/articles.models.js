const db = require("../db/connection");

exports.selectArticles = (topic) => {
  const queryValues = []
  let queryStr = `SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) :: INT comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id`;
  if (topic) {
    queryValues.push(topic)
    queryStr += ` WHERE topic = $1`
  }
  queryStr += ` GROUP BY articles.article_id
  ORDER BY created_at DESC`
  return db.query(queryStr, queryValues)
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
    WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (postData) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *`,
      postData
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticle = (patchData) => {
  return db
    .query(
      `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
      patchData
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article does not exist" });
      }
      return rows[0];
    });
};
