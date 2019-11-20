// const ejs = require("ejs");
const express = require("express");
const app = express();

// template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home", {
    date: new Date()
  });
});

app.listen(3000, err => {
  if (err) {
    console.log("Erro ao rodar servidor", err);
  }
  console.log("Servidor rodando na porta: 3000");
});
