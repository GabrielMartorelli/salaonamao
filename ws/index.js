const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const busboy = require("connect-busboy");
const busboyBodyParser = require("busboy-body-parser");
require("./database");

/* A middleware that logs all requests to the console. */
app.use(morgan("dev"));
/* A middleware that parses the body of the request and makes it available in the req.body property. */
app.use(express.json());
/* A middleware that parses the body of the request and makes it available in the req.body property. */
app.use(busboy());
/* Parsing the body of the request and making it available in the req.body property. */
app.use(busboyBodyParser());
/* A middleware that allows the server to accept requests from other domains. */
app.use(cors());

/* Setting the port to 8000. */
app.set("port", 8000);

/* Importing the routes from the file salao.routes.js. */
app.use("/salao", require("./src/routes/salao.routes"));
/* Importing the routes from the file servico.routes.js. */
app.use("/servico", require("./src/routes/servico.routes"));
/* Importing the routes from the file horario.routes.js. */
app.use("/horario", require("./src/routes/horario.routes"));
/* Importing the routes from the file colaborador.routes.js. */
app.use("/colaborador", require("./src/routes/colaborador.routes"));
/* Importing the routes from the file cliente.routes.js. */
app.use("/cliente", require("./src/routes/cliente.routes"));
/* Importing the routes from the file agendamento.routes.js. */
app.use("/agendamento", require("./src/routes/agendamento.routes"));

/* Listening to the port 8000. */
app.listen(app.get("port"), () => {
  console.log(`WebService listening on port ${app.get("port")}`);
});
