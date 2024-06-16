const { getApi } = require("../controllers/api.controllers");

const apiRouter = require("express").Router();

apiRouter.get("/", getApi)

module.exports = apiRouter