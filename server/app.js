const Koa = require("koa");
const KoaRouter = require("koa-router");
const json = require("koa-json");
const uuidv4 = require("uuid/v4");
const cors = require("@koa/cors");
const bodyParser = require("koa-body");

const app = new Koa();
const router = new KoaRouter();

//My global variable : to be replaced with DB

const tasks = [
  { uuid: "cc0f12c7-f3b6-4c86-94c2-8c4ce7751651", name: "read tasks" },
  { uuid: "cc0f12c7-f3b6-89e6-94c2-8c4ce7751651", name: "create a task " },
  { uuid: "cc0f12c7-f3b6-5561-94c2-8c4ce7751651", name: "update a task" },
];

//json prettier middleware
app.use(json());

//return all the tasks
router.get("/task/list", (ctx) => {
  ctx.status = 200;
  ctx.body = tasks;
  console.table(tasks);
});

//return a specific task in tasks
router.get("/task/:uuid", (ctx) => {
  //search the task in the list of tasks and save it in tmp variable
  const tmpTask = tasks.find((task) => task.uuid === ctx.params.uuid);

  //check if the task exist
  tmpTask != undefined
    ? ((ctx.body = tmpTask), (ctx.status = 200))
    : ((ctx.body = "Cette tache n'existe pas"), (ctx.status = 404));

  console.table(tasks);
});

//create a task
router.post("/task", (ctx) => {
  if (ctx.request.body.name == "" || ctx.request.body.name == null) {
    ctx.status = 400;
    ctx.body = "Le nom ne peux pas être null ou une chaine vide";
  } else {
    //create a temp task with a generated uuid and the name from the front end
    const tmpTask = { uuid: uuidv4(), name: ctx.request.body.name };

    //add the tmp task to the list of tasks
    tasks.push(tmpTask);
    (ctx.body = tmpTask), (ctx.status = 201);
  }
  console.table(tasks);
});

//edit a given task: name in the request body and the uuid in the param
router.put("/task/:uuid", (ctx) => {
  //get the index of the current task
  console.log(ctx.params.uuid, ctx.request.body.oldName);
  const tmpTask = tasks.find((task) => task.uuid === ctx.params.uuid);

  //check if the task exist
  if (tmpTask != undefined) {
    //check if the name given is null or empty
    if (ctx.request.body.newName == "" || ctx.request.body.newName == null) {
      ctx.status = 400;
      ctx.body = "Le nom ne peux pas être null ou une chaine vide";
    }
    //check if the name is the same as the old one
    else if (ctx.request.body.newName == ctx.request.body.oldName) {
      ctx.status = 406;
      ctx.body = "L'ancien et le nouveau nom ne peuvent pas être identiques";
    } else {
      //get the index of the tache to update it later
      const index = tasks.indexOf(tmpTask);

      //if all the condition are true we update the task
      ctx.status = 200;
      ctx.body = Object.assign(tasks[index], {
        uuid: ctx.params.uuid,
        name: ctx.request.body.newName,
      });
    }
  } else {
    ctx.status = 404;
    ctx.body = "Cette tache n'existe pas";
  }
  console.table(tasks);
});

//delete the task
router.delete("/task/:uuid", (ctx) => {
  //search the task in the list of tasks and save it in tmp variable
  const tmpTask = tasks.find((task) => task.uuid === ctx.params.uuid);

  //check if the task exist
  if (tmpTask != undefined) {
    //get the index of the task
    const index = tasks.indexOf(tmpTask);

    //remove the task and send it to the front end
    ctx.status = 200;
    ctx.body = tasks.splice(index, 1);
  } else {
    ctx.status = 404;
    ctx.body = "Cette tache n'existe pas";
  }
  console.table(tasks);
});
//router middleware
app
  .use(cors())
  .use(bodyParser())
  .use(router.allowedMethods())
  .use(router.routes());

app.listen(3000, () => console.log("server started"));
