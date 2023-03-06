const Koa = require("koa");
const app = new Koa();
const Router = require("koa-router");
const fs = require("fs");
const path = require("path");
const compilerSfc = require("vue/compiler-sfc");
const { rewriteImport, handleScript, handleTemplate, handleStyle } = require("./util");

const router = new Router();

router
  .get("/", (ctx) => {
    ctx.type = "text/html";
    ctx.body = fs.readFileSync(path.resolve(__dirname, "./index.html"));
  })
  .get(/\.js$/, (ctx) => {
    const url = ctx.url;
    console.log(url);
    const jsPath = path.join(__dirname, url);
    ctx.type = "text/javascript";
    const file = fs.readFileSync(jsPath, "utf8");
    ctx.body = rewriteImport(file);
  })
  .get(/^(\/@modules\/)/, (ctx) => {
    const url = ctx.url;
    ctx.type = "text/javascript";
    const filePrefix = path.resolve(__dirname, "node_modules", url.replace("/@modules/", ""));
    const module = require(filePrefix + "/package.json").module;
    const file = fs.readFileSync(filePrefix + "/" + module, "utf-8");
    ctx.body = rewriteImport(file);
  })
  .get(/\.vue$/, (ctx) => {
    const { query, url } = ctx.request;
    const queryType = query.type || "script";
    const vuePath = path.join(__dirname, url.split("?")[0]);
    const res = compilerSfc.parse(fs.readFileSync(vuePath, "utf8"));
    const { script, template, styles } = res.descriptor;

    const map = {
      script: () => handleScript(script, styles, url),
      template: () => handleTemplate(template),
      style: () => handleStyle(styles, query),
    };

    const body = map[queryType]();
    ctx.type = "application/javascript";
    ctx.body = body;
  })
  .get(/\.(jpeg|png|jpg)$/, (ctx) => {
    const url = ctx.url;
    ctx.body = fs.readFileSync("src" + url);
  });

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, () => console.log("server start"));
