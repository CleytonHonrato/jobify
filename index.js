// const ejs = require("ejs");
const express = require("express");
const app = express();

// conecção com db sqlite
const sqlite = require("sqlite");
const dbConnection = sqlite.open("banco.sqlite", { Promise });

const init = async () => {
  const db = await dbConnection;
  await db.run(
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);"
  );

  // const vaga = "Marketing Digital (San Francisco)";
  // const descricao = "Mais alguma coisa";
  // await db.run(
  //   `insert into vagas(categoria, titulo, descricao) values(2, '${vaga}',
  //   '${descricao}')`
  // );
};
init();

// template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const db = await dbConnection;

  const categoriasDB = await db.all("select * from categorias");

  const vagas = await db.all("select * from vagas");

  const categorias = categoriasDB.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    };
  });

  res.render("home", {
    categorias
  });
});

app.get("/vaga/:id", async (req, res) => {
  const db = await dbConnection;

  const vaga = await db.get('select * from vagas where id = ' + req.params.id)
  res.render("vaga", {
    vaga
  });
});

app.listen(3000, err => {
  if (err) {
    console.log("Erro ao rodar servidor", err);
  }
  console.log("Servidor rodando na porta: 3000");
});
