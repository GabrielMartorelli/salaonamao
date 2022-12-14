const express = require("express");
const router = express.Router();
const Salao = require("../models/salao");
const Servico = require("../models/servico");
const turf = require("@turf/turf");

/* Creating a new salon. Create*/
router.post("/", async (req, res) => {
  try {
    const salao = await new Salao(req.body).save();
    res.json({ salao });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* A route that is used to get the services of a specific salon. Read*/
router.get("/servicos/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    const servicos = await Servico.find({
      salaoId,
      status: "A",
    }).select("_id titulo");

    res.json({
      servicos: servicos.map((s) => ({ label: s.titulo, value: s._id })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* A route that is used to get the services of a specific salon. Read*/
router.get("/id", async (req, res) => {
  try {
    const salao = await Salao.findById(req.params.id).select(
      "capa nome endereco.cidade geo.coordinates telefone"
    );
    const distance = turf.distance(
      turf.point(salao.geo.coordinates),
      turf.point([-30.043858, -51.103487])
    );
    res.json({ error: false, salao, distance });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
