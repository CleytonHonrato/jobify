// const ejs = require("ejs");
const express = require("express");
const app = express();

// cara que vai entender o corpo da requisição
const bodyParser = require("body-parser");

// conecção com db sqlite
const sqlite = require("sqlite");
const dbConnection = sqlite.open("banco.sqlite", { Promise });

// inicialização do banco
const init = async () => {
  const db = await dbConnection;
  await db.run(
    // criando table categorias se não existir
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    // criando table vagas se não existir
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);"
  );
};
init();

// template engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// HOME
app.get("/", async (req, res) => {
  const db = await dbConnection;

  const categoriasDB = await db.all("select * from categorias");

  const vagas = await db.all("select * from vagas");

  // retornar minhas categorias e minhas vagas de acordo com o id
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

  // consulta da vaga referente ao id vindo por paramentro
  const vaga = await db.get("select * from vagas where id = " + req.params.id);

  // passando para vaga as vagas
  res.render("vaga", {
    vaga
  });
});

/**
 * Admin
 */
app.get("/admin", (req, res) => {
  res.render("admin/home");
});

/**
 * ////////////////////////////////////////////////////////////////////////////
 *  ------------------------  Categorias  -------------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 */

app.get("/admin/categorias/categorias", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias");

  res.render("admin/categorias/categorias", {
    categorias
  });
});

app.get("/admin/categorias/delete/:id", async (req, res) => {
  const db = await dbConnection;
  await db.run("delete from categorias where id = " + req.params.id);

  res.redirect("/admin/categorias/categorias");
});

app.get("/admin/categorias/nova", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias");

  res.render("admin/categorias/nova-categoria", {
    categorias
  });
});

app.post("/admin/categorias/nova", async (req, res) => {
  const { categorias } = req.body;
  const db = await dbConnection;
  await db.run(`insert into categorias(categoria) values('${categorias}')`);

  res.redirect("/admin/categorias/categorias");
});


app.get("/admin/categorias/editar/:id", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias");
  const cat = await db.get("select * from categorias where id = " + req.params.id);

  res.render("admin/categorias/editar-categoria", { categorias, cat });
});

app.post("/admin/categorias/editar/:id", async (req, res) => {
  const { categorias } = req.body;
  const { id } = req.params;
  const db = await dbConnection;
  await db.run(
    `update categorias set categoria = '${categorias}' where id = ${id}`
  );

  res.redirect("/admin/categorias/categorias");
});

/**
 * ////////////////////////////////////////////////////////////////////////////
 *  ------------------------------ Vagas --------------------------------------
 * ////////////////////////////////////////////////////////////////////////////
 */

app.get("/admin/vaga", async (req, res) => {
  const db = await dbConnection;
  const vagas = await db.all("select * from vagas");

  res.render("admin/vaga", {
    vagas
  });
});

app.get("/admin/vaga/nova", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias");

  res.render("admin/nova-vaga", {
    categorias
  });
});

app.post("/admin/vaga/nova", async (req, res) => {
  const { titulo, descricao, categorias } = req.body;
  const db = await dbConnection;
  await db.run(
    `insert into vagas(categoria, titulo, descricao) values(${categorias}, '${titulo}',
    '${descricao}')`
  );

  res.redirect("/admin/vaga");
});

/**
 * ////////////////////////////////////////////////////////////////////////////
 *  ---------------------- Administração de vagas -----------------------------
 * ////////////////////////////////////////////////////////////////////////////
 */

app.get("/admin/vaga/editar/:id", async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias");
  const vaga = await db.get("select * from vagas where id = " + req.params.id);

  res.render("admin/editar-vaga", { categorias, vaga });
});

app.post("/admin/vaga/editar/:id", async (req, res) => {
  const { titulo, descricao, categorias } = req.body;
  const { id } = req.params;
  const db = await dbConnection;
  await db.run(
    `update vagas set categoria = ${categorias}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`
  );

  res.redirect("/admin/editar");
});

/**
 * @description deleta uma vaga especifica
 */
app.get("/admin/vaga/delete/:id", async (req, res) => {
  const db = await dbConnection;
  await db.run("delete from vagas where id = " + req.params.id);

  res.redirect("/admin/vaga");
});

app.listen(3000, err => {
  if (err) {
    console.log("Erro ao rodar servidor", err);
  }
  console.log("Servidor rodando na porta: 3000");
});
