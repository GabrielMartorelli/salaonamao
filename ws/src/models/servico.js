const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the database. */
const servico = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  comissao: {
    type: Number,
    required: true,
  },
  duracao: {
    type: Date,
    required: true,
  },
  recorrencia: {
    type: Number,
    required: true,
  },
  descricao: {
    type: String,
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

module.exports = mongoose.model("Servico", servico);
