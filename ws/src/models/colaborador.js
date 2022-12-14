const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the mongoose model. */
const colaborador = new Schema({
  nome: {
    type: String,
    required: true,
  },
  telefone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  senha: {
    type: String,
    default: null,
  },
  foto: {
    type: String,
    required: true,
  },
  dataNascimento: {
    type: String,
    required: true,
  },
  sexo: {
    type: String,
    enum: ["M", "F"],
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    default: "A",
    required: true,
  },
  contaBancaria: {
    titular: {
      type: String,
      required: true,
    },
    cpfCnpj: {
      type: String,
      required: true,
    },
    banco: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: [
        "conta_corrente",
        "conta_poupanca",
        "conta_corrente_conjunta",
        "conta_poupanca_conjunta",
      ],
      required: true,
    },
    agencia: {
      type: String,
      required: true,
    },
    numero: {
      type: String,
      required: true,
    },
    dv: {
      type: String,
      required: true,
    },
  },
  recipientId: {
    type: String,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Colaborador", colaborador);
