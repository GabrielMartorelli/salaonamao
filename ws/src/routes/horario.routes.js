const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Horario = require("../models/horario");
const ColaboradorServico = require("../models/relationship/colaboradorServico");

/* Creating a new Horario and saving it to the database. Create*/
router.post("/", async (req, res) => {
  try {
    const horario = await new Horario(req.body).save();
    res.json({ horario });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* Getting the salaoId from the params and then finding the horarios that have the same salaoId. Generic Route to get all salon schedules */
router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    const horarios = await new Horario.find({
      salaoId,
    });
    res.json({ horarios });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* Updating the horario with the horarioId in the params. Generic Route to update the schedules */
router.put("/:horarioId", async (req, res) => {
  try {
    const { horarioId } = req.params;
    const horario = req.body;
    await new Horario.findByIdAndUpdate(horarioId, horario);
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* This is a route that is used to get the list of colaboradores that are available to work in the
schedule. Generic Route to list all collaborators who are involved in such service */
router.post("/colaboradores", async (req, res) => {
  try {
    const colaboradorServico = await ColaboradorServico.find({
      servicoId: { $in: req.body.especialidades },
      status: "A",
    })
      .populate("colaboradorId", "nome")
      .select("colaboradorId -_id");
    const listaColaboradores = _.uniqBy(colaboradorServico, (vinculo) =>
      vinculo.colaboradorId._id.toString()
    ).map((vinculo) => ({
      label: vinculo.colaboradorId.nome,
      value: vinculo.colaboradorId._id,
    }));
    res.json({ error: false, listaColaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* Deleting the horario with the horarioId in the params. Generic Route to delete the schedules */
router.delete("/:horarioId", async (req, res) => {
  try {
    const { horarioId } = req.params;
    await new Horario.findByIdAndDelete(horarioId);
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
