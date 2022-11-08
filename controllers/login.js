const createHttpError = require("http-errors");
const { endpointResponse } = require("../helpers/success");
const { catchAsync } = require("../helpers/catchAsync");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const { User } = require("../database/models");
const bcrypt = require("bcrypt");

module.exports = {
  signUp: catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const hashPass = await bcrypt.hash(password, 10);

    try {

      const { firstName, lastName, email, password } = req.body;
      const hashPass = await bcrypt.hash(password, 10).then(function (hash) {
        return hash;
      });


      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        const user = await User.create({
          firstName,
          lastName,
          email,
          password: hashPass,
          avatar: req.file.path,
        });
        const token = jwt.sign({ id: user.id }, config.SECRET, {
          expiresIn: 86400,
        });
        endpointResponse({
          res,
          message: "User created successfully",
          body: { token, user: user },
        });
      } else {
        const httpError = createHttpError(
          404,
          `[Error email already exist] - [index - POST]: 'Error the email: ${email} already exist`
        );
        next(httpError);
      }
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
      // console.log(validPassword);
      if (!validPassword) {
        const httpError = createHttpError(
          404,
          `[Error retrieving info] - [index - GET]: 'Incorrect password'`
        );
        next(httpError);
      } else {
        const token = jwt.sign({ id: userFound.id }, config.SECRET, {
          expiresIn: 86400,
        });

        endpointResponse({
          res,
          message: "Users logged",
          body: { token, user: userFound },
        });
      }
    } catch (err) {
      next(err);
    }
  }),
};
