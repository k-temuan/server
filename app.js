/* istanbul ignore file */
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const morgan = require("morgan");
const routers = require("./routes");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

app.use(morgan("dev"));
app.use(cors());
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routers);
app.use(errorHandler);

module.exports = app;
