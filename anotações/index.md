# Falando de cada rota

## E se armazenássemos o conteúdo de forma estruturada

### Banco de dados

Vamos pensar em DB como uma tabela de dados, na qual podemos usufruir de seus dados para exibir da forma que o cliente pedir,lembrando que os dados da tabela tem que esta de forma estruturada, uma coluna para um certo tipo de dado e uma linha para o dado em se.

### Arquivos estruturados

Lembrando que os dados da tabela tem que esta de forma estruturada, uma coluna para um certo tipo de dado e uma linha para o dado em se.

### Atualizações rápidas

Poucas páginas para criar refletem muitas vagas, ou seja, tratando de projetos simples tentar tornar os arquivos estruturados a forma mais simples e rápida para a aplicação.

## Iniciando

### sqltie

O SQLite é um banco que chamanos de _self contentment_, ou seja ele se contém. Como assim se contém, isso significa que ao intalar ele no projeto, o arquivos configurado ira funcionar em qualquer linguagem juntamente com o modulo, "_nada mais é que para onde o projeto for o sqlite vai junto_".

Instalação:

```javascript
  npm i sqlite
```

Depois de instalarmos precisamos criar uma conecção com o banco de dados.

```javascript
const sqlite = require("sqlite");
const dbConnection = sqlite.open("banco.sqlite", { Promise });
```

> obs: _banco.sqlite_ é o alias do meu DB que eu crio, e _{ Promise }_ é a forma de promessa que ele vai utilizar no caso iremos utilziar a forma padrão.

Depois de criar a conecção precisamos iniciar o banco de dados, para isso vamos criar uma função para iniciar e criar as devidas tabelas.
Inicializando:

```javascript
const init = async () => {
  const db = await dbConnection;
  await db.run(
    // criando table categorias se não existir
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    // criando table vagas se não existir
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);" // criando table categorias se não existir
  );
};
init(); // chama a função no event loop;
```

Agora com as tabelas criadas e o banco iniciado, podemos fazer com que os dados da table sejá exibido na nossa home, lembrando que o express aceita funções no padrão ascync/await.

```javascript
// HOME
app.get("/", async (req, res) => {
  // chamada da conecção do DB
  const db = await dbConnection;

  // selecionando todas as categorias
  const categoriasDB = await db.all("select * from categorias");

  // selecionando todas as vagas
  const vagas = await db.all("select * from vagas");

  // retornar minhas categorias e minhas vagas de acordo com o id
  const categorias = categoriasDB.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    };
  });

  // passando os parametros para o arquivo ejs
  res.render("home", {
    categorias
  });
});
```
