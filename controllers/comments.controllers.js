const { removeComment, updateComment } = require("../models/comments.models");

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id).then(() => {
    res.status(204).send()
  }).catch(next)
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateComment([inc_votes, comment_id])
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
}