const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const pagarme = require("../services/pagarme");
const _ = require("lodash");
const moment = require("moment");
const util = require("../util");
const keys = require("../data/keys.json");
const Cliente = require("../models/cliente");
const Salao = require("../models/salao");
const Servico = require("../models/servico");
const Colaborador = require("../models/colaborador");
const Agendamento = require("../models/agendamento");
const Horario = require("../models/horario");

/* Creating a new appointment. Create */
router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();
  try {
    const { clientId, salaoId, servicoId, colaboradorId } = req.body;

    const cliente = await Cliente.findById(clientId).select(
      "nome endereco customerId"
    );

    const salao = await Salao.findById(salaoId).select("recipientId");

    const servico = await Servico.findById(servicoId).select(
      "preco titulo comissao"
    );

    const colaborador = await Colaborador.findById(colaboradorId).select(
      "recipientId"
    );

    const precoFinal = util.toCents(servico.preco) * 100;

    const colaboradorSplitRule = {
      recipient_id: colaboradorId.recipientId,
      amount: parseInt(precoFinal * (servico.comissao / 100)),
    };

    const createPayment = await pagarme("/transactions", {
      amount: precoFinal,
      card_number: "4111111111111111",
      card_cvv: "123",
      card_expiration_date: "0922",
      card_holder_name: "Morpheus Fishburne",
      customer: {
        id: cliente.customerId,
      },
      billing: {
        name: cliente.nome,
        address: {
          country: cliente.endereco.pais.toLowerCase(),
          state: cliente.endereco.uf.toLowerCase(),
          city: cliente.endereco.cidade,
          street: cliente.endereco.logradouro,
          street_number: cliente.endereco.numero,
          zipcode: cliente.endereco.cep,
        },
      },
      items: [
        {
          id: servicoId,
          title: servico.titulo,
          unit_price: precoFinal,
          quantity: 1,
          tangible: false,
        },
      ],
      split_rules: [
        {
          recipient_id: salao.recipientId,
          amount: precoFinal - keys.app_fee - colaboradorSplitRule.amount,
        },
        colaboradorSplitRule,
        {
          recipient_id: keys.recipient_id,
          amount: keys.app_fee,
          charge_processing_fee: false,
        },
      ],
    });

    if (createPayment.error) {
      throw createPayment;
    }

    const agendamento = await new Agendamento({
      ...req.body,
      transacionId: createPayment.data.id,
      comissao: servico.comissao,
      valor: servico.preco,
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ error: false, agendamento });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

/* A filter for appointments. Generic Route to get the scheduling periods*/
router.post("/filter", async (req, res) => {
  try {
    const { periodo, salaoId } = req.body;

    const agendamentos = await Agendamento.find({
      status: "A",
      salaoId,
      data: {
        $gte: moment(periodo.inicio).startOf("day"),
        $lte: moment(periodo.final).endOf("day"),
      },
    }).populate([
      { path: "servicoId", select: "titulo duracao" },
      { path: "colaboradorId", select: "nome" },
      { path: "clienteId", select: "nome" },
    ]);

    res.json({ error: false, agendamentos });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post("/dias-disponiveis", async (req, res) => {
  try {
    const { data, salaoId, servicoId } = req.body;
    const horarios = await Horario.find({ salaoId });
    const servico = await Servico.findById(servicoId).select("duracao");

    let agenda = [];
    let colaboradores = [];
    let lastDay = moment(data);

    const servicoMinutos = util.hourToMinutes(
      moment(servico.duracao).format("HH:mm")
    );

    const servicoSlots = util.sliceMinutes(
      servico.duracao,
      moment(servico.duracao).add(servicoMinutos, "minutes"),
      util.SLOT_DURATION
    ).length;

    for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
      const espacosValidos = horarios.filter((horario) => {
        const diaSemanaDisponivel = horario.dias.includes(
          moment(lastDay).day()
        );

        const servicoDisponivel = horario.especialidades.includes(servicoId);

        return diaSemanaDisponivel && servicoDisponivel;
      });

      if (espacosValidos.length > 0) {
        let todosHorariosDia = {};

        for (let spaco of espacosValidos) {
          for (let colaboradorId of spaco.colaboradores) {
            if (!todosHorariosDia[colaboradorId]) {
              todosHorariosDia[colaboradorId] = [];
            }

            todosHorariosDia[colaboradorId] = [
              ...todosHorariosDia[colaboradorId],
              ...util.sliceMinutes(
                util.mergeDateTime(lastDay, spaco.inicio),
                util.mergeDateTime(lastDay, spaco.fim),
                util.SLOT_DURATION
              ),
            ];
          }
        }

        for (let colaboradorId of Object.keys(todosHorariosDia)) {
          const agendamentos = await Agendamento.find({
            colaboradorId,
            data: {
              $gte: moment(lastDay.startOf("day")),
              $lte: moment(lastDay.endOf("day")),
            },
          })
            .select("data servicoId -_id")
            .populate("servicoId", "duracao");

          let horariosOcupados = agendamentos.map((agendamento) => ({
            inicio: moment(agendamento.data),
            final: moment(agendamento.data).add(
              util.hourToMinutes(
                moment(agendamento.servicoId.duracao).format("HH:mm")
              ),
              "minutes"
            ),
          }));
        }

        horariosOcupados = horariosOcupados
          .map((horario) =>
            util.sliceMinutes(horario.inicio, horario.final, util.SLOT_DURATION)
          )
          .flat();

        let horariosLivres = util
          .splitByValue(
            todosHorariosDia[colaboradorId].map((horarioLivre) => {
              return horariosOcupados.includes(horarioLivre)
                ? "-"
                : horarioLivre;
            }),
            "-"
          )
          .filter((space) => space.length > 0);

        horariosLivres = horariosLivres.filter(
          (horarios) => horarios.length >= servicoSlots
        );

        horariosLivres = horariosLivres
          .map((slot) =>
            slot.filter((horario, index) => slot.length - index >= servicoSlots)
          )
          .flat();

        horariosLivres = _.chunk(horariosLivres, 2);

        if (horariosLivres.length == 0) {
          todosHorariosDia = _.omit(todosHorariosDia, colaboradorId);
        } else {
          todosHorariosDia[colaboradorId] = horariosLivres;
        }
      }

      const totalEspecialistas = Object.keys(todosHorariosDia).length;

      if (totalEspecialistas > 0) {
        colaboradores.push(Object.keys(todosHorariosDia));
        agenda.push({
          [lastDay.format("YYYY-MM-DD")]: todosHorariosDia,
        });
      }
    }
    lastDay = lastDay.add(1, "day");

    colaboradores = _.uniq(colaboradores.flat());

    colaboradores = await Colaborador.find({
      _id: { $in: colaboradores },
    }).select("nome foto");

    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(" ")[0],
    }));

    res.json({ error: false, colaboradores, agenda });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
