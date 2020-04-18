const { Event, User, Tag, EventTag, Attendee } = require('../models')

class EventController {
  static findAll(req, res, next) {
    Event.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstname', 'lastname', 'email', 'photo_url'],
        },
        {
          model: EventTag,
          attributes: ['id', 'EventId', 'TagId'],
          include: [
            {
              model: Tag,
              attributes: ['name'],
            },
          ],
        },
        {
          model: Attendee,
          include: [
            {
              model: User,
              attributes: ['id', 'firstname', 'lastname', 'email', 'photo_url'],
            },
          ],
        },
      ],
    })
      .then((events) => {
        res.status(200).json({
          events: events,
        })
      })
      .catch((err) => {
        next(err)
      })
  }

  static create(req, res, next) {
    const image_url = req.file.path
    const {
      name,
      category,
      description,
      max_attendees,
      location,
      date_time,
      tags,
    } = req.body

    const UserId = req.decoded.id

    Event.create({
      name,
      category,
      description,
      max_attendees,
      image_url,
      location,
      date_time,
      UserId,
    })
      .then((response) => {
        const eventId = response.id
        const eventTags = []
        tags.forEach((el) => {
          const eventTag = {
            TagId: el,
            EventId: eventId,
          }
          eventTags.push(eventTag)
        })
        EventTag.bulkCreate(eventTags)
          .then((result) => {
            Event.findByPk(eventId, {
              include: [
                {
                  model: EventTag,
                  include: [{ model: Tag }],
                },
              ],
            })
              .then((result) => {
                res.status(201).json({
                  event: result,
                })
              })
              .catch(next)
          })
          .catch(next)
      })
      .catch((err) => {
        next(err)
      })
  }
  static findById(req, res, next) {
    Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstname', 'lastname', 'email', 'photo_url'],
        },
        {
          model: EventTag,
          attributes: ['id', 'EventId', 'TagId'],
          include: [
            {
              model: Tag,
              attributes: ['name'],
            },
          ],
        },
        {
          model: Attendee,
          include: [
            {
              model: User,
              attributes: ['id', 'firstname', 'lastname', 'email', 'photo_url'],
            },
          ],
        },
      ],
    })
      .then((response) => {
        if (response) {
          res.status(200).json({
            event: response,
          })
        } else {
          let err = {
            name: 'custom',
            status: 404,
            message: 'Event Not Found',
          }
          throw err
        }
      })
      .catch((err) => {
        next(err)
      })
  }
  static joinEvent(req, res, next) {
    const EventId = req.params.id
    const UserId = req.decoded.id
    Attendee.create({
      EventId,
      UserId,
    })
      .then((response) => {
        res.status(201).json({
          message: `${response.UserId} join event ${response.EventId}`,
        })
      })
      .catch((err) => {
        next(err)
      })
  }
  static update(req, res, next) {
    let image_url
    if (req.file) {
      image_url = req.file.path
    } else {
      image_url = ''
    }
    const EventId = req.params.id
    const {
      name,
      category,
      description,
      max_attendees,
      location,
      date_time,
      tags,
    } = req.body

    const UserId = req.decoded.id
    Event.findByPk(EventId)
      .then((response) => {
        if (response) {
          Event.update(
            {
              name,
              category,
              description,
              max_attendees,
              image_url,
              location,
              date_time,
              UserId,
            },
            {
              where: {
                id: EventId,
              },
            }
          )
            .then((updated) => {
              EventTag.destroy({ where: { EventId } })
                .then((result) => {
                  const newTags = []

                  tags.forEach((el) => {
                    const newTag = {
                      TagId: el,
                      EventId,
                    }
                    newTags.push(newTag)
                  })
                  EventTag.bulkCreate(newTags)
                    .then((result) => {
                      Event.findByPk(EventId, {
                        include: [
                          {
                            model: EventTag,
                            include: [{ model: Tag }],
                          },
                        ],
                      })
                        .then((result) => {
                          res.status(200).json({
                            event: result,
                          })
                        })
                        .catch(next)
                    })
                    .catch(next)
                })
                .catch((err) => {
                  next(err)
                })
            })
            .catch((err) => {
              next(err)
            })
        } else {
          let err = {
            name: 'custom',
            status: 400,
            message: 'Event not found',
          }
          next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  }
  static delete(req, res, next) {
    let EventId = req.params.id

    Event.findOne({
      where: {
        id: EventId,
      },
    })
      .then((found) => {
        if (found) {
          return Event.destroy({
            where: {
              id: EventId,
            },
          })
        } else {
          let err = {
            name: 'custom',
            status: 404,
            message: 'Event Not Found',
          }
          throw err
        }
      })
      .then((deleted) => {
        res.status(200).json({
          data: 'deleted',
        })
      })

      .catch((err) => {
        next(err)
      })
  }
}

module.exports = EventController
