const { Tag } = require("../models");

class TagController {
  static findAll(req, res, next) {
    Tag.findAll()
      .then((data) => {
        res.status(200).json({
          tags: data,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static findById(req, res, next) {
    const TagId = req.params.id;
    Tag.findByPk(TagId)
      .then((response) => {
        if (response) {
          res.status(200).json({
            tag: response,
          });
        } else {
          let err = {
            name: "custom",
            status: 404,
            message: "Tag Not Found",
          };
          throw err;
        }
      })
      .catch((err) => {
        next(err);
      });
  }
  static create(req, res, next) {
    const { name } = req.body;
    Tag.create({ name })
      .then((data) => {
        res.status(201).json({
          tag: data,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static update(req, res, next) {
    const TagId = req.params.id;
    const { name } = req.body;

    Tag.findByPk(TagId)
      .then((response) => {
        if (!response) {
          let err = {
            name: "custom",
            status: 404,
            message: "Tag not found",
          };
          throw err;
        } else {
          return Tag.update(
            { name },
            {
              where: {
                id: TagId,
              },
              returning: true,
            }
          );
        }
      })
      .then((updated) => {
        res.status(200).json({
          tag: updated[1][0],
        });
      })
      .catch((err) => {
        next(err);
      });
  }
  static delete(req, res, next) {
    const TagId = req.params.id;
    Tag.findByPk(TagId)
      .then((response) => {
        if (!response) {
          let err = {
            name: "custom",
            status: 404,
            message: "Tag not found",
          };
          throw err;
        } else {
          return Tag.destroy({
            where: {
              id: TagId,
            },
          });
        }
      })
      .then((deleted) => {
        res.status(200).json({
          message: "Data Deleted",
        });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = TagController;
