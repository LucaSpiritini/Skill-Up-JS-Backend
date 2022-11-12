const createHttpError = require("http-errors");
const { Transaction, Category } = require("../database/models");
const { endpointResponse } = require("../helpers/success");
const { catchAsync } = require("../helpers/catchAsync");
const { getPagination, paginateData } = require("../helpers/pagination");
const { Op } = require("sequelize");
const { filterElements } = require("../helpers/filter");

module.exports = {
  getTransactions: catchAsync(async (req, res, next) => {
    const { categoryId, description, page, size, currency } = req.query;
    const userId = req.body.id;
    console.log(userId);
    const filter = filterElements({
      userId,
      categoryId,
      description,
      currency,
    });

    const { limit, offset } = getPagination(page, size);
    try {
      const data = await Transaction.findAndCountAll({
        where: { [Op.and]: [filter] },
        limit,
        offset,
      });

      const response = paginateData(data, page, limit);
      endpointResponse({
        res,
        message: "Transactions retrieved successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving transactions] - [index - GET]: ${error.message}`
      );
      next(httpError);
    }
  }),
  // getTransactionById: catchAsync(async (req, res, next) => {
  //   const { id } = req.params;
  //   try {
  //     const response = await Transaction.findByPk(id);

  //     if (!response) {
  //       const httpError = createHttpError(
  //         401,
  //         `[Error retrieving transaction] - [index - GET]: Couldn't find a transaction with the ID ${id}`
  //       );
  //       return next(httpError);
  //     }
  //     endpointResponse({
  //       res,
  //       message: "Transaction retrieved successfully",
  //       body: response,
  //     });
  //   } catch (error) {
  //     const httpError = createHttpError(
  //       error.statusCode,
  //       `[Error retrieving transaction] - [index - GET]: ${error.message}`
  //     );
  //     return next(httpError);
  //   }
  // }),
  createTransaction: catchAsync(async (req, res, next) => {
    const { amount, description, userId, categoryId, toUserId } = req.body;

    // if (!amount || !description || !userId || !categoryId || !type) {
    //   const httpError = createHttpError(
    //     400,
    //     `[Error creating transactions] - [index - POST]: All fields are required`

    //   )
    //   return next(httpError)
    // }
    // if (amount <= 0) {
    //   const httpError = createHttpError(
    //     403,
    //     'apllication/json'
    //       `[Error creating transactions] - [index - POST]: Amount must be greater than 0`,
    //   )
    //   return next(httpError)
    // }
    const date = new Date();

    try {
      const response = await Transaction.create({
        amount,
        description,
        date,
        userId,
        categoryId,
        toUserId,
      });

      endpointResponse({
        res,
        message: "Transaction created successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error creating transactions] - [index - POST]: ${error.message}`
      );
      next(httpError);
    }
  }),
  updateTransaction: catchAsync(async (req, res, next) => {
    const { description } = req.body;
    const { id } = req.params;
    if (!description) {
      const httpError = createHttpError(
        400,
        `[Error updating transactions] - [index - PUT]: amount, userId, categoryId and date are required`
      );
      return next(httpError);
    }

    const foundTransaction = await Transaction.findByPk(id);
    if (!foundTransaction) {
      const httpError = createHttpError(
        401,
        `[Error updating transactions] - [index - PUT]: Couldn't find a transaction with the ID ${id}`
      );
      return next(httpError);
    }
    if (foundTransaction.toUserId) {
      const httpError = createHttpError(
        400,
        `[Error updating transactions] - [index - PUT]: Cannot update this transaction`
      );
      return next(httpError);
    }

    try {
      const response = await foundTransaction.update({
        description,
      });
      endpointResponse({
        res,
        message: "Transaction updated successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error updating transactions] - [index - PUT]: ${error.message}`
      );
      next(httpError);
    }
  }),
  deleteTransaction: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    try {
      const response = await Transaction.destroy({ where: { id } });
      endpointResponse({
        res,
        message: "Transaction removed successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error deleting transactions] - [index - DELETE]: ${error.message}`
      );
      next(httpError);
    }
  }),
  getBalance: catchAsync(async (req, res, next) => {
    console.log("ENTRO ACA");
    const userId = req.body.id;
    //TODO probably we shouldn't send the id at params.
    console.log(userId);
    console.log(req.body);
    try {
      const incomePesos = await Transaction.sum("amount", {
        where: { userId, categoryId: 1, currency: "pesos" },
      });
      const outcomePesos = await Transaction.sum("amount", {
        where: { userId, categoryId: 2, currency: "pesos" },
      });
      const incomeEuros = await Transaction.sum("amount", {
        where: { userId, categoryId: 1, currency: "euros" },
      });
      const outcomeEuros = await Transaction.sum("amount", {
        where: { userId, categoryId: 2, currency: "euros" },
      });
      const incomeDolares = await Transaction.sum("amount", {
        where: { userId, categoryId: 1, currency: "dolares" },
      });
      const outcomeDolares = await Transaction.sum("amount", {
        where: { userId, categoryId: 2, currency: "dolares" },
      });
      let balancePesos = incomePesos - outcomePesos;
      if (balancePesos < 0) balancePesos = 0;
      let balanceDolares = incomeDolares - outcomeDolares;
      if (balanceDolares < 0) balanceDolares = 0;
      let balanceEuros = incomeEuros - outcomeEuros;
      if (balanceEuros < 0) balanceEuros = 0;
      const balanceArray = [
        {
          currency: "pesos",
          balance: balancePesos,
          income: incomePesos,
          outcome: outcomePesos,
        },
        {
          currency: "dolares",
          balance: balanceDolares,
          income: incomeDolares,
          outcome: outcomeDolares,
        },
        {
          currency: "euros",
          balance: balanceEuros,
          income: incomeEuros,
          outcome: outcomeEuros,
        },
      ];
      const response = balanceArray;

      endpointResponse({
        res,
        message: "Get balance successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error getting transactions] - [index - GET]: ${error.message}`
      );
      next(httpError);
    }
  }),
};
