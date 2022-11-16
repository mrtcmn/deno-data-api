import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import {getQuery} from "https://deno.land/x/oak@v11.1.0/helpers.ts";

const router = new Router();
router
    .get("/", (context) => {
        context.response.body = "Hello world!";
    })
    .get("/metrics", (context) => {
        let allQueries =  getQuery(context, { mergeParams: true });

        if (books.has(context?.params?.id)) {
            context.response.body = books.get(context.params.id);
        }
    });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
