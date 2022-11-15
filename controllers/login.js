const createHttpError = require("http-errors");
const { endpointResponse } = require("../helpers/success");
const { catchAsync } = require("../helpers/catchAsync");
const { User, Role } = require("../database/models");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokensFunctions");

module.exports = {
  signUp: catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, avatar } = req.body;

    if (!firstName || !lastName || !email || !password) {
      const httpError = createHttpError(
        404,
        `[Error missing fields] - [index - POST]: 'Required fields`
      );
      next(httpError);
    }

    const hashPass = await bcrypt.hash(password, 10).then(function (hash) {
      return hash;
    });
    try {
      const searchUser = await User.findOne({ where: { email } });

      if (searchUser) {
        return res.status(404).send({ error: "Error Email Exist!" });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashPass,
        avatar: avatar ? avatar : "https://www.alkemy.org/logo512.png",
      });

      const token = await generateToken({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      });
      endpointResponse({
        res,
        message: "User created successfully",
        body: { token },
      });
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving users] - [index - POST]: ${error.message}`
      );
      next(httpError);
    }
  }),

  signIn: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        const httpError = createHttpError(
          404,
          `[Error retrieving info] - [index - GET]: 'Missing fields to fill'`
        );
        next(httpError);
      }

      const userFound = await User.findOne({ where: { email } });

      if (!userFound) {
        const httpError = createHttpError(
          404,
          `[Error retrieving info] - [index - GET]: 'The email does not exist'`
        );
        next(httpError);
      }
      const validPassword = await User.prototype.comparePassword(
        password,
        userFound?.dataValues.password
      );
      if (!validPassword) {
        const httpError = createHttpError(
          404,
          `[Error retrieving info] - [index - GET]: 'Incorrect password'`
        );
        next(httpError);
      } else {
        const token = await generateToken({
          id: userFound.id,
          firstName: userFound.firstName,
          lastName: userFound.lastName,
          email: userFound.email,

          avatar: userFound.avatar,
          roleId: userFound.roleId,
        });

        endpointResponse({
          res,
          message: "Users logged",
          body: { token },
        });
      }
    } catch (error) {
      const httpError = createHttpError(
        error.statusCode,
        `[Error retrieving users] - [index - POST]: ${error.message}`
      );
      next(httpError);
    }
  }),
};
