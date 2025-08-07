const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors');
const serve = require('koa-static');
const path = require('path');
const { bodyParser } = require('@koa/bodyparser');
const userRouter = require('./router/user.js');

app.use(cors());

app.use(serve(path.join(__dirname, 'public')));

app.use(bodyParser({
  jsonLimit: '10mb',    // JSON请求体限制10MB
  formLimit: '10mb',    // 表单请求体限制10MB
  textLimit: '10mb',    // 文本请求体限制10MB 
  enableTypes: ['json', 'form', 'text']
}));

app.use(userRouter.routes(), userRouter.allowedMethods());

app.listen(3000, () => {
    console.log('server is running at port 3000');
});