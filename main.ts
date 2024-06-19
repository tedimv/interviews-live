import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { allLocales, Faker } from "@faker-js/faker";
import { v4 as uuidV4 } from "uuid";

const app = new Application();
const router = new Router();

const db = await Deno.openKv();
export const Table = {
  users: "users",
} as const;

// app.use(oakCors({
//   origin: "*"
// }));

router.delete("/admin/users/:id/really", async (ctx) => {
  await db.delete([Table.users, ctx.params.id]);
  ctx.response.status = 204;
});

router.post("/admin/users/create/really", async (ctx) => {
  const faker = new Faker({ locale: [allLocales.en_US, allLocales.en] });
  const id = uuidV4();
  const newUser = {
    id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: 23
  };

  await db.set([Table.users, id], newUser);
  ctx.response.body = newUser;
});

router.get("/asset/crypto", async (ctx) => {
  const assetPrice = await import("./asset_crypto.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/asset/properties", async (ctx) => {
  const assetPrice = await import("./asset_properties.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/asset/rare_metals", async (ctx) => {
  const assetPrice = await import("./asset_rare_metals.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/asset/stocks", async (ctx) => {
  const assetPrice = await import("./asset_stocks.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const user = await db.get([Table.users, id]);

  if (!user.value) {
    return ctx.response.status = 404;
  }

  ctx.response.body = user.value;
});

router.put("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const userFound = await db.get([Table.users, id]);
  if (!userFound.value) {
    return ctx.response.status = 404;
  }

  const payload = await ctx.request.body.json();
  await db.set([Table.users, id], { ...payload, id });
  const updated = await db.get([Table.users, id]);
  ctx.response.body = updated.value as object;
});

app.use(router.routes());
app.listen({ port: 5000 });
