const request = require('supertest')
const { generateToken } = require('../helpers/jwt')
const app = require('../app')
const { User, sequelize } = require('../models')
const { queryInterface } = sequelize

let access_token
let user_twoId

beforeAll((done) => {
  const user_one = {
    firstname: 'Rama',
    lastname: 'Desi',
    email: 'ramadesy.saragih@gmail.com',
    password: 'desi123',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
  }
  const user_two = {
    firstname: 'Arda',
    lastname: 'Nadia',
    email: 'arda.nadia@gmail.com',
    password: 'arda123',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80',
  }
  User.create(user_one)
    .then((user) => {
      return User.findOne({
        where: {
          id: user.id,
        },
      })
    })
    .then((user) => {
      access_token = generateToken({ id: user.id })
      User.create(user_one)
        .then((user) => {
            user_twoId = user.id
            done()
        })
    })
})

afterAll((done) => {
  queryInterface
    .bulkDelete('Friends', {})
    .then((_) => {
      done()
    })
    .catch((err) => done(err))
})

describe('Friend Endpoints', () => {
  describe('success process', () => {
    describe('get friends', () => {
      it('should return an object friends and status 200', (done) => {
        request(app)
          .get('/friends')
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('friends', expect.any(Array))
            done()
          })
      })
    })

    describe('create friend', () => {
      it('should create a new friend', (done) => {
        const data = {
          FriendId: user_twoId,
        }
        request(app)
          .post(`/friends`)
          .set('access_token', access_token)
          .send(data)
          .end((err, res) => {
            expect(res.statusCode).toEqual(201)
            expect(res.body).toHaveProperty('friend')
            done()
          })
      })
    })

    describe('Get one friend success', () => {
      it('should fetch a single tag', (done) => {
        request(app)
          .get(`/friends/${user_twoId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('friend')
            done()
          })
      })
    })

    describe('Delete one friend success', () => {
      it('should delete a single friend', (done) => {
        request(app)
          .delete(`/friends/${user_twoId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            done()
          })
      })
    })
  })
  describe('error process', () => {
    describe('create friend', () => {
      it('should return validation error', (done) => {
        request(app)
          .post('/friends')
          .set('access_token', access_token)
          .field('name', '')
          .end((err, res) => {
            expect(res.statusCode).toEqual(400)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('FriendId is required')
            done()
          })
      })
    })

    describe('Get one tag error', () => {
      it('should return error not found', (done) => {
        request(app)
          .get(`/friends/0`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            done()
          })
      })
    })
    describe('Delete one tag error not found', () => {
      it('should return error not found', (done) => {
        request(app)
          .delete(`/friends/xxx`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            done()
          })
      })
    })
  })
})
