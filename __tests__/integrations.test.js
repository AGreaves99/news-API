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
