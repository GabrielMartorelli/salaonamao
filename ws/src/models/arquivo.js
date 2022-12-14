const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* Creating a schema for the database. */
const arquivo = new Schema({
  referenciaId: {
    type: Schema.Types.ObjectId,
    refPath: "model",
  },
  model: {
    type: String,
    required: true,
    enum: ["Servico", "Salao"],
  },
  caminho: {
    type: String,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Arquivo", arquivo);
