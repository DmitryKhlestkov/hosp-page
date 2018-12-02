const express = require("express");
const bodyParser = require("body-parser");
var app = express();

function connection_sql(text, arr, page, result, render = false){

    res_query = [];
    text = text || 'select now();';
    values = arr || [];

    const { Pool, Client } = require('pg');

    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'postgres',
        port: '5432'
    });

    client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
    })
    client.query(text, values, (err, res) => {
       if (err) {
       console.log(err.stack);
     } else {
        console.log(res.rows);
        if(render)
          result.render(page, {obj: res.rows})
     }
     client.end();
    });
}

function renderFromDb(page, result, args, text, render = false){ //Вообще - передать procces_result надо тут, а не определять в теле модуля
    // let arr = [];
    // const text = 'SELECT * FROM "Pacient";';
    connection_sql(text, args, page, result, render);
};

var router = express.Router();

var urlEncodedParser = bodyParser.urlencoded({extended: false});

//укажем шаблонизатор
app.set("view engine", "ejs");
//подключаем статические файлы
app.use("/public", express.static("public"));

var path = __dirname + '/views/';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/index",function(req,res){
  //res.sendFile(path + "index.html");
  res.render('index');
});

router.post("*", urlEncodedParser, function(req,res){
  //res.sendFile(path + "index.html");
  if(!req.body) return res.sendStatus(400);
  console.log(req.body);

  if(req.body.pacient_name && req.body.pacient_surname && req.body.pacient_patr && req.body.pacient_dob && req.body.pacient_snils)
  {
    var args = [req.body.pacient_name, req.body.pacient_surname, req.body.pacient_patr, req.body.pacient_dob, req.body.pacient_snils];
    const text = 'INSERT INTO "Pacient"("Имя","Фамилия","Отчетсво","ДатаРождения", "СНИЛС") VALUES($1, $2, $3, $4, $5)';;
    renderFromDb('list_pacients', res, args, text, false);
  } else if (req.body.search_res) {
    var args = [req.body.search_res + '%'];
    const text = 'SELECT * FROM "Pacient" WHERE "Фамилия" Ilike $1';
    renderFromDb('list_pacients', res, args, text, true);
  }
  //res.render('index');
});

router.get("/list_pacients",function(req,res){
  var args = [];
  const text = 'SELECT * FROM "Pacient";';
  renderFromDb('list_pacients', res, args, text, true);
});

router.get("/about",function(req,res){
  //res.sendFile(path + "about.html");
  res.render('about');
});

app.use("/",router);

app.use("*",function(req,res){
  //res.sendFile(path + "404.html");
  res.render('404');
});

app.listen(8081, function () {
  console.log('Example app listening on port 8081!')
})
