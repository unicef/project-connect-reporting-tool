const express = require("express");
const req = require("express/lib/request");
const hbs = require("hbs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;

const { getProjectConnectData, getDailyData } = require("./util");

//Define path for Express config
const publicDirectory = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

//Setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

//Setup static directory to serve
app.use(express.static(publicDirectory));

app.get("/", async (req, res) => {
  res.render("index");
});
app.get("/api/report", async (req, res) => {
  const date = req.query.date ? req.query.date : null;
  let data = await getProjectConnectData(date);
  res.send(data);
});

app.get("/api/daily", async (req, res) => {
  const date = req.query.date ? req.query.date : null;
  let data = await getDailyData(date);
  res.send(data);
});

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(`Server startes on ${PORT}`);
});
