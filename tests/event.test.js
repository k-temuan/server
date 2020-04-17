const request = require('supertest')
const { generateToken } = require('../helpers/jwt')
const app = require('../app')
const { User, Tag, sequelize } = require('../models')
const { queryInterface } = sequelize

let access_token
let eventId
let tagId

const eventImage = `${__dirname}/eventImage.jpeg`

beforeAll((done) => {
  const input = {
    firstname: 'Rama',
    lastname: 'Desi',
    email: 'ramadesy.saragih@gmail.com',
    password: 'desi123',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
  }
  User.create(input)
    .then((user) => {
      return User.findOne({
        where: {
          id: user.id,
        },
      })
    })
    .then((user) => {
      access_token = generateToken({ id: user.id })
      Tag.create({ name: 'Tech' }).then((tag) => {
        tagId = tag.id
        done()
      })
    })
})

afterAll((done) => {
  queryInterface
    .bulkDelete('Events', {})
    .then((_) => {
      done()
    })
    .catch((err) => done(err))
})

describe('Events Endpoints', () => {
  describe('success process', () => {
    describe('get events', () => {
      it('should return an object events and status 200', (done) => {
        request(app)
          .get('/events')
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('events', expect.any(Array))
            done()
          })
      })
    })
    describe('create event', () => {
      it('should create a new event', (done) => {
        request(app)
          .post(`/events`)
          .set('access_token', access_token)
          .attach('image', eventImage, {
            contentType: 'application/octet-stream',
          })
          .field('name', 'Mabar DOTA 2')
          .field('category', 'Game')
          .field('description', 'Mabar DOTA 2 area Jakarta')
          .field('max_attendees', 10)
          .field('location', 'Jakarta')
          .field('date_time', new Date())
          .field('tags', [tagId])
          .end((err, res) => {
            expect(res.statusCode).toEqual(201)
            expect(res.body).toHaveProperty('event')
            expect(res.body.event).toHaveProperty('name', 'Mabar DOTA 2')
            expect(res.body.event).toHaveProperty('category', 'Game')
            expect(res.body.event).toHaveProperty(
              'description',
              'Mabar DOTA 2 area Jakarta'
            )
            expect(res.body.event).toHaveProperty('image_url')
            expect(res.body.event).toHaveProperty('max_attendees', 10)
            expect(res.body.event).toHaveProperty('location', 'Jakarta')
            expect(res.body.event).toHaveProperty('date_time')
            expect(res.body.event).toHaveProperty('Tags')
            eventId = res.body.event.id
            done()
          })
      })
    })
    describe('Get one event success', () => {
      it('should fetch a single event', (done) => {
        request(app)
          .get(`/events/${eventId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('event')
            expect(res.body.event).toHaveProperty('name', 'Mabar DOTA 2')
            expect(res.body.event).toHaveProperty('category', 'Game')
            expect(res.body.event).toHaveProperty(
              'description',
              'Mabar DOTA 2 area Jakarta'
            )
            expect(res.body.event).toHaveProperty('image_url')
            expect(res.body.event).toHaveProperty('max_attendees', 10)
            expect(res.body.event).toHaveProperty('location', 'Jakarta')
            expect(res.body.event).toHaveProperty('date_time')
            expect(res.body.event).toHaveProperty('Tags')
            done()
          })
      })
    })

    describe('update event with image', () => {
      it('should update a event with image', (done) => {
        request(app)
          .put(`/events/${eventId}`)
          .set('access_token', access_token)
          .attach('image', eventImage, {
            contentType: 'application/octet-stream',
          })
          .field('name', 'Mabar DOTA 2')
          .field('category', 'PC Game')
          .field('description', 'Mabar DOTA 2 area Jakarta Barat')
          .field('max_attendees', 100)
          .field('location', 'Jakarta Barat')
          .field('date_time', new Date())
          .field('tags', [tagId])
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('event')
            expect(res.body.event).toHaveProperty('name', 'Mabar DOTA 2')
            expect(res.body.event).toHaveProperty('category', 'PC Game')
            expect(res.body.event).toHaveProperty(
              'description',
              'Mabar DOTA 2 area Jakarta Barat'
            )
            expect(res.body.event).toHaveProperty('image_url')
            expect(res.body.event).toHaveProperty('max_attendees', 100)
            expect(res.body.event).toHaveProperty('location', 'Jakarta Barat')
            expect(res.body.event).toHaveProperty('date_time')
            expect(res.body.event).toHaveProperty('Tags')
            done()
          })
      })
    })

    describe('update event without image', () => {
      it('should update event without image', (done) => {
        request(app)
          .put(`/events/${eventId}`)
          .set('access_token', access_token)
          .field('name', 'Mabar DOTA 2')
          .field('category', 'PC Game')
          .field('description', 'Mabar DOTA 2 area Jakarta Barat')
          .field('max_attendees', 100)
          .field('location', 'Jakarta Barat')
          .field('date_time', new Date())
          .field('tags', [tagId])
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('event')
            expect(res.body.event).toHaveProperty('name', 'Mabar DOTA 2')
            expect(res.body.event).toHaveProperty('category', 'PC Game')
            expect(res.body.event).toHaveProperty(
              'description',
              'Mabar DOTA 2 area Jakarta Barat'
            )
            expect(res.body.event).toHaveProperty('image_url')
            expect(res.body.event).toHaveProperty('max_attendees', 100)
            expect(res.body.event).toHaveProperty('location', 'Jakarta Barat')
            expect(res.body.event).toHaveProperty('date_time')
            expect(res.body.event).toHaveProperty('Tags')
            done()
          })
      })
    })

    describe('Delete one event success', () => {
      it('should delete a single event', (done) => {
        request(app)
          .delete(`/events/${eventId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            done()
          })
      })
    })
  })
  describe('error process', () => {
    describe('create event authentication error', () => {
      it('should return authentication error', (done) => {
        request(app)
          .post(`/events`)
          .attach('image', eventImage, {
            contentType: 'application/octet-stream',
          })
          .field('name', 'Mabar DOTA 2')
          .field('category', 'Game')
          .field('description', 'Mabar DOTA 2 area Jakarta')
          .field('max_attendees', 10)
          .field('location', 'Jakarta')
          .field('date_time', new Date())
          .field('tags', [tagId])
          .end((err, res) => {
            expect(res.statusCode).toEqual(401)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('Not Authorized')
            expect(res.body.errors.length).toBeGreaterThan(0)
            done()
          })
      })
    })
    describe('create event', () => {
      it('should return validation error', (done) => {
        request(app)
          .post(`/events`)
          .set('access_token', access_token)
          .attach('image', eventImage, {
            contentType: 'application/octet-stream',
          })
          .field('category', 'Game')
          .field('description', 'Mabar DOTA 2 area Jakarta')
          .field('max_attendees', 10)
          .field('location', 'Jakarta')
          .field('date_time', new Date())
          .field('tags', [tagId])
          .end((err, res) => {
            expect(res.statusCode).toEqual(400)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('name is required')
            expect(res.body.errors.length).toBeGreaterThan(0)
            done()
          })
      })
    })

    describe('Get one products error', () => {
      it('should return error not found', (done) => {
        request(app)
          .get(`/events/0`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('Event Not Found')
            expect(res.body.errors.length).toBeGreaterThan(0)
            done()
          })
      })
    })
    describe('Delete one products error not found', () => {
      it('should return error not found', (done) => {
        request(app)
          .delete(`/events/xxx`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('Event Not Found')
            expect(res.body.errors.length).toBeGreaterThan(0)
            done()
          })
      })
    })
  })
})
