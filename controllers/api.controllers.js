const { selectApi } = require("../models/api.models");

exports.getApi = (req, res, next) => {
  selectApi().then((contents) => {
    const endpoints = JSON.parse(contents);
    res.status(200).send({ endpoints });
  })
  .catch(next)
};
