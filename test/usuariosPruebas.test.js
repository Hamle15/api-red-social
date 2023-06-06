const supertest = require("supertest");

const app = require("../index");

const api = supertest(app);

describe("functions users", () => {
  test("should login credentials", async () => {
    const payload = {
      email: "hamletpirazanpoma@gmail.com",
      password: "Perrocamamanzana1.",
    };

    const response = await api.post("/api/user/login").send(payload);
    console.log(response.body.user.name, "Holaaaa");
    expect(response.body.user.name).toBe("Sombra525");
  });
});
