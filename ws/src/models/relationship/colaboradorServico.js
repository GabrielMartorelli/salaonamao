const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the database. */
const colaboradorServico = new Schema({
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  servicoId: {
    type: mongoose.Types.ObjectId,
    ref: "Servico",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    default: "A",
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ColaboradorServico", colaboradorServico);
