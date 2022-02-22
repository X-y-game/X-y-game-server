import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import logger from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import indexRouter from "./routes/index";
import socket from "./socket";
import "./db";

const app = express();

app.use("/public", express.static(__dirname + "/public"));
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json({
    status: err.status,
    message: err.message,
  });
});

const handleListen = () =>
  console.log(`Listening on http://localhost:${process.env.PORT}`);

const server = http.createServer(app);

const port = process.env.PORT || 8080;
server.listen(port, handleListen);
socket(server);

module.exports = server;
//
