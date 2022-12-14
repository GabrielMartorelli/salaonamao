const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const pagarme = require("../services/pagarme");
const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relationship/salaoColaborador");
const ColaboradorServico = require("../models/relationship/colaboradorServico");

/* A function that is being called when the user sends a POST request to the route /colaborador. Create */
router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { colaborador, salaoId } = req.body;
    let newColaborador = null;
    const existentColaborador = await Colaborador.findOne({
      $or: [{ email: colaborador.email }, { telefone: colaborador.telefone }],
    });

    if (!existentColaborador) {
      const { contaBancaria } = colaborador;
      const pagarmeBankAccount = await pagarme("bank_accounts", {
        agencia: contaBancaria.agencia,
        bank_code: contaBancaria.banco,
        conta: contaBancaria.numero,
        conta_dv: contaBancaria.dv,
        type: contaBancaria.tipo,
        document_number: contaBancaria.cpfCnpj,
        legal_name: contaBancaria.titular,
      });

      if (pagarmeBankAccount.error) {
        throw pagarmeBankAccount;
      }

      const pagarmeRecipient = await pagarme("/recipients", {
        transfer_interval: "daily",
        transfer_enabled: true,
        bank_account_id: pagarmeBankAccount.data.id,
      });

      if (pagarmeRecipient.error) {
        throw pagarmeRecipient;
      }

      newColaborador = await Colaborador({
        ...colaborador,
        recipientId: pagarmeRecipient.data.id,
      }).save({ session });
    }

    const colaboradorId = existentColaborador
      ? existentColaborador._id
      : newColaborador._id;

    const existentRelationship = await SalaoColaborador.findOne({
      salaoId,
      colaboradorId,
      status: { $ne: "E" },
    });

    if (!existentRelationship) {
      await new SalaoColaborador({
        salaoId,
        colaboradorId,
        status: colaborador.vinculo,
      }).save({ session });
    }

    if (existentColaborador) {
      await SalaoColaborador.findOneAndUpdate(
        {
          salaoId,
          colaboradorId,
        },
        { status: colaborador.vinculo },
        { session }
      );
    }

    await ColaboradorServico.insertMany(
      colaborador.especialidades.map(
        (servicoId) => ({
          servicoId,
          colaboradorId,
        }),
        { session }
      )
    );

    await session.commitTransaction();
    session.endSession();

    if (existentColaborador && existentRelationship) {
      res.json({ error: true, message: "Colaborador já cadastrado" });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

/* A function that is being called when the user sends a PUT request to the route
/colaborador/:colaboradorId. Update*/
router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, vinculoId, especialidades } = req.body;
    const { colaboradorId } = req.params;

    await SalaoColaborador.findByIdAndUpdate(vinculoId, { status: vinculo });

    await ColaboradorServico.deleteMany({
      colaboradorId,
    });

    await ColaboradorServico.insertMany(
      especialidades.map((servicoId) => ({
        servicoId,
        colaboradorId,
      }))
    );
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* A function that is being called when the user sends a DELETE request to the route
/colaborador/vinculo/:id. Logical Delete */
router.delete("/vinculo/:id", async (req, res) => {
  try {
    await SalaoColaborador.findByIdAndUpdate(res.params.id, { status: "E" });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* A function that is being called when the user sends a POST request to the route /colaborador/filter. Generic Route to filter collaborators*/
router.post("/filter", async (req, res) => {
  try {
    const colaboradores = await Colaborador.find(req.body.filters);
    res.json({ error: false, colaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/* This is a route that is being called when the user sends a GET request to the route
/colaborador/salao/salaoId. Generic Route to get the links and join the collaborator model*/
router.get("/salao/salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    let listaColaboradores = [];
    const salaoColaboradores = await SalaoColaborador.find({
      salaoId,
      status: { $ne: "E" },
    })
      .populate({
        path: "colaboradorId",
        select: "-senha -recipientId",
      })
      .select("colaboradorId dataCadastro status");
    for (let vinculo of salaoColaboradores) {
      const especialidades = await ColaboradorServico.find({
        colaboradorId: vinculo.colaboradorId._doc,
      });
      listaColaboradores.push({
        ...vinculo._id,
        especialidades,
      });
    }
    res.json({
      error: false,
      colaboradores: listaColaboradores.map((vinculo) => ({
        ...vinculo.colaboradorId._doc,
        vinculoId: vinculo._id,
        vinculo: vinculo.status,
        especialidades: vinculo.especialidades,
        dataCadastro: vinculo.dataCadastro,
      })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
