const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(data);
});
afterAll(() => {
  return db.end();
});

describe('General Errors', () => {
    test("GET 404: responds with a 404 when trying to access a non-existent endpoint", () => {
        return request(app).get("/api/not-an-endpoint").expect(404)
    })
});
describe("GET /api/topics", () => {
  test("GET 200: responds with an array of topics", () => {
    return request(app).get("/api/topics").expect(200)
    .then(({body}) => {
        expect(body.topics.length).toBe(3)
        body.topics.forEach((topic) => {
            expect(topic).toMatchObject({
                slug: expect.any(String),
                description: expect.any(String)
            })
        })
    })
  });
});