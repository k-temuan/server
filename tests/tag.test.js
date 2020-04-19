const request = require('supertest')
const { getToken } = require('../helpers/jwt') 
const app = require('../app')
const { User, sequelize } = require('../models')
const { queryInterface } = sequelize

let access_token
let tagId

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
      access_token = getToken({ id: user.id })
      done()
    })
})

afterAll((done) => {
  queryInterface
    .bulkDelete('Tags', {})
    .then((_) => {
      done()
    })
    .catch((err) => done(err))
})

afterAll((done) => {
  queryInterface
    .bulkDelete('Users', {})
    .then((_) => {
      done()
    })
    .catch((err) => done(err))
})

describe('Tag Endpoints', () => {
  describe('success process', () => {
    describe('get tags', () => {
      it('should return an object tags and status 200', (done) => {
        request(app)
          .get('/tags')
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('tags', expect.any(Array))
            done()
          })
      })
    })

    describe('create tag', () => {
      it('should create a new tag', (done) => {
        const data = {
          name: 'Tech',
        }
        request(app)
          .post(`/tags`)
          .set('access_token', access_token)
          .send(data)
          .end((err, res) => {
            expect(res.statusCode).toEqual(201)
            expect(res.body).toHaveProperty('tag')
            expect(res.body.tag).toHaveProperty('name', 'Tech')
            tagId = res.body.tag.id
            done()
          })
      })
    })

    describe('Get one tag success', () => {
      it('should fetch a single tag', (done) => {
        request(app)
          .get(`/tags/${tagId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('tag')
            expect(res.body.tag).toHaveProperty('name', 'Tech')
            done()
          })
      })
    })

    describe('update tag success', () => {
      it('should update a tag', (done) => {
        const data = {
          name: 'Photography',
        }
        request(app)
          .patch(`/tags/${tagId}`)
          .set('access_token', access_token)
          .send(data)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty('tag')
            expect(res.body.tag).toHaveProperty('name', 'Photography')
            done()
          })
      })
    })

    describe('Delete one tag success', () => {
      it('should delete a single tag', (done) => {
        request(app)
          .delete(`/tags/${tagId}`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(200)
            done()
          })
      })
    })
  })
  describe('error process', () => {
    describe('create tag', () => {
      it('should return validation error', (done) => {
        request(app)
          .post('/tags')
          .set('access_token', access_token)
          .field('name', '')
          .end((err, res) => {
            expect(res.statusCode).toEqual(400)
            expect(res.body).toHaveProperty('errors', expect.any(Array))
            expect(res.body.errors).toContain('Tag name cannot be empty')
            done()
          })
      })
    })

    describe('update tag error not found', () => {
      it('should return tag not found', (done) => {
        const data = {
          name: 'Photography',
        }
        request(app)
          .patch(`/tags/${tagId + 1}`)
          .set('access_token', access_token)
          .send(data)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            expect(res.body).toHaveProperty('errors')
            done()
          })
      })
    })

    describe('Get one tag error', () => {
      it('should return error not found', (done) => {
        request(app)
          .get(`/tags/0`)
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
          .delete(`/tags/0`)
          .set('access_token', access_token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(404)
            done()
          })
      })
    })
  })
})
