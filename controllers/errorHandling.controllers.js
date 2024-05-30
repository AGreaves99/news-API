exports.endpointError = (req, res) => {
  res.status(404).send({ msg: "Endpoint not found" });
};

exports.customErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.pSQLErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Invalid body" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Request not found" });
  } else next(err);
};

exports.serverError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
};
