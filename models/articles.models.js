const db = require("../db/connection");

exports.selectArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  const allowedSorts = [
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const queryValues = [];

  let queryStr = `SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) :: INT comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $${queryValues.length}`;
  }

  if (!allowedSorts.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  queryStr += ` GROUP BY articles.article_id
  ORDER BY ${sort_by}`;

  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  queryStr += ` ${order}`;

  if (Number.isNaN(Number(limit))) {
    return Promise.reject({ status: 400, msg: "Invalid limit query" });
  }
  queryValues.push(limit);
  queryStr += ` LIMIT $${queryValues.length}`;

  if (Number.isNaN(Number(p))) {
    return Promise.reject({ status: 400, msg: "Invalid p query" });
  }
  queryValues.push(limit * (p - 1))
  queryStr += ` OFFSET $${queryValues.length}`

  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.comment_id) :: INT comment_count FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id`,
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

exports.insertArticle = ([
  title,
  topic,
  author,
  body,
  article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
]) => {
  return db
    .query(
      `INSERT INTO articles (title, topic, author, body, article_img_url)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *`,
      [title, topic, author, body, article_img_url]
    )
    .then(({ rows }) => {
      const article = rows[0];
      article.comment_count = 0;
      return article;
    });
};
