const createHttpError = require("http-errors");
const { Role } = require("../database/models");
const { endpointResponse } = require("../helpers/success");
const { catchAsync } = require("../helpers/catchAsync");
const bcrypt = require("bcrypt");
// example of a controller. First call the service, then build the controller method
module.exports = {
  get: catchAsync(async (req, res, next) => {
    try {
      const response = await Role.findAll();
      endpointResponse({
        res,
        message: "Users retrieved successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving users] - [index - GET]: ${error.message}`
      );
      next(httpError);
    }
  }),
  create: catchAsync(async (req, res, next) => {
    const { id, rol } = req.body;

    try {
      const response = await Role.create({
        id,
        rol,
      });
      endpointResponse({
        res,
        message: "User created successfully",
        body: response,
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving users] - [index - POST]: ${error.message}`
      );
      next(httpError);
    }
  }),
};
