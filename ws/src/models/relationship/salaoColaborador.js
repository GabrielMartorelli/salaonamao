const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the database. */
const salaoColaborador = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I", "E"],
    default: "A",
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SalaoColaborador", salaoColaborador);
