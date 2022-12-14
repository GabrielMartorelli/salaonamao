const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the database. */
const salao = new Schema({
  nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  foto: String,
  capa: String,
  email: {
    type: String,
    required: [true, "Email é obrigatório"],
  },
  senha: {
    type: String,
    default: null,
  },
  telefone: String,
  endereco: {
    cidade: String,
    uf: String,
    cep: String,
    numero: String,
    pais: String,
  },
  geo: {
    tipo: String,
    coordinates: [Number],
  },
  recipientId: String,
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

/* Creating a 2dsphere index on the geo field. */
salao.index({ geo: "2dsphere" });

module.exports = mongoose.model("Salao", salao);
