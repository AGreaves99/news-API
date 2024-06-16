const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpointsFromJSON = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});
afterAll(() => {
  return db.end();
});

describe("General Errors", () => {
  test("GET 404: responds with a 404 when trying to access a non-existent endpoint", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("GET 200: responds with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api", () => {
  test("GET 200: responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(endpoints).toEqual(endpointsFromJSON);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET 200: responds with an object that has properties matching columns from the article table", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 11,
        });
      });
  });
  test("GET 200: responds with an object that has a comment_count of 0 for an article that has no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 0,
        });
      });
  });
  test("GET 404: responds with an appropriate status and error message when given a valid but non-existent ID", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("GET 400: responds with an appropriate status and error message when given a non-valid ID", () => {
    return request(app)
      .get("/api/articles/not-valid-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe.only("GET /api/articles", () => {
  test("GET 200: responds with an array of articles, sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).not.toHaveLength(0);
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: responds with an array of articles with a topic equal to that in the query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).not.toHaveLength(0);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "mitch",
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: sends an empty array when topic query is valid but no articles have that topic", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(0);
      });
  });
  test("GET 404: sends an error message when topic query is invalid", () => {
    return request(app)
      .get("/api/articles?topic=hello")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("slug not found");
      });
  });
  test("GET 200: sends an array of articles to the client sorted by the respective columns in descending order", async () => {
    const columns = [
      "article_id",
      "author",
      "title",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
      "comment_count",
    ];
    const queryPromises = columns.map((column) => {
      return request(app).get(`/api/articles?sort_by=${column}`);
    });
    const resolvedPromises = await Promise.all(queryPromises);
    resolvedPromises.forEach((result, index) => {
      expect(result.status).toBe(200);
      const { articles } = result.body;
      expect(articles).not.toHaveLength(0);
      expect(articles).toBeSortedBy(columns[index], {
        descending: true,
      });
    });
  });
  test("GET 200: responds with an array of articles, sorted by date ascending", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).not.toHaveLength(0);
        expect(articles).toBeSortedBy("created_at");
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 400: sends an error message when sort_by query is not a valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort query");
      });
  });
  test("GET 400: sends an error message when order query is not asc or desc", () => {
    return request(app)
      .get("/api/articles?order=hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order query");
      });
  });
  test("GET 200: limit query correctly limits the articles shown", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(5);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: articles limit defaults to 10 when not supplied in query", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(10);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: returns correct articles when given a page query", () => {
    return request(app)
      .get("/api/articles?limit=10&p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(3);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: defaults to first page when not supplied a p query", () => {
    return request(app)
      .get("/api/articles?limit=12")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(12);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 400: sends an error message when limit query is invalid", () => {
    return request(app)
      .get("/api/articles?limit=not-valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid limit query");
      });
  });
  test("GET 400: sends an error message when p query is invalid", () => {
    return request(app)
      .get("/api/articles?p=not-valid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid p query");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET 200: responds with an array of comments for the given article ID sorted by descending date", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(11);
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  test("GET 200: responds with an empty array when given an existing article_id of an article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(0);
      });
  });
  test("GET 404: responds with an appropriate status and error message when given a valid but non-existent ID", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("GET 400: responds with an appropriate status and error message when given a non-valid ID", () => {
    return request(app)
      .get("/api/articles/not-valid-id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST 201: responds with the comment posted ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a good article",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "This is a good article",
          article_id: 1,
        });
      });
  });
  test("POST: 400 responds with appropriate status and error message when provided with a malformed comment object", () => {
    const newComment = {
      username: "butter_bridge",
      not_a_property: "not-a-value",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid body");
      });
  });
  test("POST: 404 responds with appropriate status and error message when provided a valid but non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a good article",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Request not found");
      });
  });
  test("POST: 404 responds with appropriate status and error message when provided an invalid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a good article",
    };
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("POST: 400 responds with appropriate status and error message when provided a valid but non-existent username", () => {
    const newComment = {
      username: "invalid_id",
      body: "This is a good article",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Request not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH: 200 updates the votes of an existing article", () => {
    const newVote = { inc_votes: 2 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 102,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided with a malformed vote object", () => {
    const newVote = {
      not_an_article_property: 12,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid body");
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided with an vote object that violates the table schema", () => {
    const newVote = {
      inc_votes: "not_a_number",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("PATCH: 404 responds with appropriate status and error message when provided a valid but non-existent article_id", () => {
    const newVote = {
      inc_votes: 12,
    };
    return request(app)
      .patch("/api/articles/9999")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided an invalid article_id", () => {
    const newVote = {
      inc_votes: 21,
    };
    return request(app)
      .patch("/api/articles/not_a_number")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE 204: deletes specified comment", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("DELETE 404: responds with an appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment not found");
      });
  });
  test("DELETE 400: responds with an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/invalid-id")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET 200: responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users:username", () => {
  test("responds with a user object corresponding to the correct uesrname", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("GET 404: responds with an appropriate status and error message when given a non-existent username", () => {
    return request(app)
      .get("/api/users/not-a-user")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User does not exist");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH: 200 updates the votes of an existing comment", () => {
    const newVote = { inc_votes: 2 };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 18,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided with a malformed vote object", () => {
    const newVote = {
      not_an_article_property: 12,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid body");
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided with an vote object that violates the table schema", () => {
    const newVote = {
      inc_votes: "not_a_number",
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("PATCH: 404 responds with appropriate status and error message when provided a valid but non-existent comment_id", () => {
    const newVote = {
      inc_votes: 12,
    };
    return request(app)
      .patch("/api/comments/9999")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment does not exist");
      });
  });
  test("PATCH: 400 responds with appropriate status and error message when provided an invalid comment_id", () => {
    const newVote = {
      inc_votes: 21,
    };
    return request(app)
      .patch("/api/comments/not_a_number")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST 201: responds with the comment posted ", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "This Best Article Ever Written",
      body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
      topic: "paper",
      article_img_url: "https://article-img.jpeg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "butter_bridge",
          title: "This Best Article Ever Written",
          body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
          topic: "paper",
          article_img_url: "https://article-img.jpeg",
          article_id: 14,
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("POST 201: responds with the comment posted and a default image when an image URL is not given", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "This Best Article Ever Written",
      body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: "butter_bridge",
          title: "This Best Article Ever Written",
          body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
          topic: "paper",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: 14,
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("POST: 400 responds with appropriate status and error message when provided with a malformed article object", () => {
    const newArticle = {
      not_an_author: "not-an-author",
      title: "This Best Article Ever Written",
      body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid body");
      });
  });
  test("POST: 404 responds with appropriate status and error message when provided an object with a non-existent author property", () => {
    const newArticle = {
      author: "not-an-author",
      title: "This Best Article Ever Written",
      body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Request not found");
      });
  });
  test("POST: 404 responds with appropriate status and error message when provided an object with a non-existent topic property", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "This Best Article Ever Written",
      body: "I have written an article so fantastic that my mind now transcends all mortal limitation",
      topic: "not-a-topic",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Request not found");
      });
  });
});
