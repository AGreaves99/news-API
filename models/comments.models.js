const db = require("../db/connection");

exports.removeComment = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id = $1`,
      [comment_id]
    )
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.updateComment = (patchData) => {
  return db
    .query(
      `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *`,
      patchData
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment does not exist" });
      }
      return rows[0];
    });
};
