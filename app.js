const express = require("express");
const bodyParser = require("body-parser");
var app = express();
//
const pg = require("pg");
const pgConstStringData = "postgres://postgres:postgres@localhost:5432/postgres"

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

router.post("/index", urlEncodedParser, function(req,res){
  //res.sendFile(path + "index.html");
  if(!req.body) return res.sendStatus(400);
  console.log(req.body);
  if()
  pg.connect(pgConstStringData, function (err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err)
    }
    client.query('INSERT INTO "Pacient"("Имя","Фамилия","Отчетсво","ДатаРождения", "СНИЛС") VALUES($1, $2, $3, $4, $5)',
    [req.body.pacient_name, req.body.pacient_surname, req.body.pacient_patr, req.body.pacient_dob, req.body.pacient_snils],
    function (err, result) {
      done()
      if (err) {
        return console.error('error happened during query', err)
      }
      console.log(result.rows[0])
      process.exit(0)
    })
  })
  res.render('index');
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
