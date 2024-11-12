require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsOption = require("./config/corsOpstions");
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routs/roots"));

app.use("/auth", require("./routs/authRouter"));
app.use("/users", require("./routs/userRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 page not found" });
  } else {
    res.type("txt").send("404 txt not found");
  }
});

mongoose.connection.once("open", () => {
  console.log("we are in bitch");

  app.listen(PORT, () => {
    console.log(`app listen on prot, ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
