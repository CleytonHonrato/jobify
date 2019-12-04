// const ejs = require("ejs");
const express = require("express");
const app = express();

// cara que vai entender o corpo da requisição
const bodyParser = require('body-parser')

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
};
init();

// template engine
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))

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

/**
 * Admin
 */
app.get('/admin', (req, res) => {
  res.render('admin/home')
});

/**
 * Vagas
 */
app.get('/admin/vaga', async (req, res) => {
  const db = await dbConnection;
  const vagas = await db.all('select * from vagas')

  res.render('admin/vaga', {
    vagas
  })
});

/**
 * categorias
 */
app.get('/admin/categorias/categorias', async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all('select * from categorias')

  res.render('admin/categorias/categorias', {
    categorias
  })
});

/**
 * @description deleta uma categoria
 */
app.get('/admin/categorias/delete/:id', async (req, res) => {
  const db = await dbConnection;
  await db.run('delete from categorias where id = ' + req.params.id);

  res.redirect('/admin/categorias');
})



/**
 * @description deleta uma vaga especifica
 */
app.get('/admin/vaga/delete/:id', async (req, res) => {
  const db = await dbConnection;
  await db.run('delete from vagas where id = ' + req.params.id);

  res.redirect('/admin/vaga');
});


app.get('/admin/categorias/nova', async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all('select * from categorias')

  res.render('admin/categorias/nova-categoria', {
    categorias
  })
});


app.get('/admin/vaga/nova', async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all('select * from categorias')

  res.render('admin/nova-vaga', {
    categorias
  })
});

app.post('/admin/vaga/nova', async (req, res) => {
  const { titulo, descricao, categorias } = req.body;
  const db = await dbConnection;
  await db.run(
    `insert into vagas(categoria, titulo, descricao) values(${categorias}, '${titulo}',
    '${descricao}')`
  );

  res.redirect('/admin/vaga')
});

app.get('/admin/vaga/editar/:id', async (req, res) => {
  const db = await dbConnection;
  const categorias = await db.all('select * from categorias');
  const vaga = await db.get('select * from vagas where id = ' + req.params.id)

  res.render('admin/editar-vaga', { categorias, vaga })
});

app.post('/admin/vaga/editar/:id', async (req, res) => {
  const { titulo, descricao, categorias } = req.body;
  const { id } = req.params;
  const db = await dbConnection;
  await db.run(
    `update vagas set categoria = ${categorias}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`
  );

  res.redirect('/admin/editar')
});

app.listen(3000, err => {
  if (err) {
    console.log("Erro ao rodar servidor", err);
  }
  console.log("Servidor rodando na porta: 3000");
});
