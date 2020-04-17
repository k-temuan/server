module.exports = function (err, req, res, next) {
  let status = 500;
  let message = { message: "Internal Server Error" };
  let errors = [];
  switch (err.name) {
    case "SequelizeValidationError":
      err.errors.forEach((element) => {
        errors.push(element.message);
      });
      message = {
        message: "Bad Request",
        errors: errors,
      };
      status = 400;
      res.status(status).json(message);
      break;
    case "SequelizeUniqueConstraintError":
      err.errors.forEach((element) => {
        errors.push(element.message);
      });
      message = {
        message: "Bad Request",
        errors: errors,
      };
      status = 400;
      res.status(status).json(message);
      break;
    case "custom":
      errors = [err.message];
      status = err.status;
      message = {
        message: "Bad Request",
        errors: errors,
      };
      res.status(status).json(message);
      break;
    default:
      res.status(status).json(message);
      break;
  }
};
