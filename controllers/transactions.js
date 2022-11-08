const createHttpError = require("http-errors");
const { Transaction, User } = require("../database/models");
const { endpointResponse } = require("../helpers/success");
const { catchAsync } = require("../helpers/catchAsync");
const { getPagination, paginateData } = require("../helpers/pagination");
const { Op } = require("sequelize");
const { filterElements } = require("../helpers/filter");

module.exports = {
  getTransactions: catchAsync(async (req, res, next) => {
    const { categoryId, description, page, size, currency } = req.query;

    const filter = filterElements({ categoryId, description, currency });

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
  getTransactionById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    try {
      const response = await Transaction.findByPk(id);

      if (!response) {
        const httpError = createHttpError(
          401,
          `[Error retrieving transaction] - [index - GET]: Couldn't find a transaction with the ID ${id}`
        );
        return next(httpError);
      }
      endpointResponse({
        res,
        message: "Transaction retrieved successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving transaction] - [index - GET]: ${error.message}`
      );
      return next(httpError);
    }
  }),
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
    const date = new Date()

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
    const { id } = req.params;
    //TODO probably we shouldn't send the id at params.

    try {
      const income = await Transaction.sum("amount", {
        where: { userId: id, categoryId: 1 },
      });
      const outcome = await Transaction.sum("amount", {
        where: { userId: id, categoryId: 2 },
      });
      let balance = income - outcome;
      if (balance < 0) balance = 0;
      const response = { balance, income, outcome };
      endpointResponse({
        res,
        message: "Transaction removed successfully",
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
