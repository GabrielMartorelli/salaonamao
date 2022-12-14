const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a new schema for the database. */
const salaoCliente = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  clienteId: {
    type: mongoose.Types.ObjectId,
    ref: "Cliente",
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

module.exports = mongoose.model("SalaoCliente", salaoCliente);
