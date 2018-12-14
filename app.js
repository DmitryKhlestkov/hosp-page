const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
var app = express();

var pg = require('pg');
var connect = "postgres://postgres:postgres@localhost/postgres";

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

router.get("/",function(req,res){
  //res.sendFile(path + "index.html");
  res.render('index');
});

router.post("/addpac", urlEncodedParser, function(req,res){
  if(!req.body)
    return res.sendStatus(400);
  console.log(req.body);

  if(req.body.pacient_name && req.body.pacient_surname && req.body.pacient_patr && req.body.pacient_dob && req.body.pacient_snils)
  {
    var args = [req.body.pacient_name, req.body.pacient_surname, req.body.pacient_patr, req.body.pacient_dob, req.body.pacient_snils];
    const text = 'INSERT INTO "Pacient"("Имя","Фамилия","Отчетсво","ДатаРождения", "СНИЛС") VALUES($1, $2, $3, $4, $5)';;
    pg.connect(connect, function(err, client, done){
      if(err){
        console.log('error fetching client from pool', err);
      }
      client.query(text, args, function(err, result){
        done();
        res.redirect('index');

        if(err){
          return console.log('error runing query', err);
        }
        console.log(result.rows)
      });
    });
  }
});

router.post("/adddoctor", urlEncodedParser, function(req,res){
  if(!req.body)
    return res.sendStatus(400);
  console.log(req.body);

  if(req.body.doctor_name && req.body.doctor_surname && req.body.doctor_patr && req.body.doctor_spec)
  {
    var args = [req.body.doctor_name, req.body.doctor_surname, req.body.doctor_patr, req.body.doctor_spec];
    const text = 'INSERT INTO "Doctor"("Имя","Фамилия","Отчетсво","Специальность") VALUES($1, $2, $3, $4)';;
    pg.connect(connect, function(err, client, done){
      if(err){
        console.log('error fetching client from pool', err);
      }
      client.query(text, args, function(err, result){
        done();
        res.redirect('index');

        if(err){
          return console.log('error runing query', err);
        }
        console.log(result.rows)
      });
    });
  }
  else {
    console.log('not insert');
  }
});

router.post('/searchlike', urlEncodedParser, function(req, res){
  if (req.body.search_res) {
    var args = [req.body.search_res + '%'];
    const text = 'SELECT * FROM "Pacient" WHERE "Фамилия" Ilike $1';
    pg.connect(connect, function(err, client, done){
      if(err){
        console.log('error fetching client from pool', err);
      }
      client.query(text, args, function(err, result){
        var rs =result.rows
        rs.forEach(function(element, index, array) {
          var dt = moment(new Date(element.ДатаРождения)).format("YYYY-MM-DD").toString();
          //console.log(dt);
          element.ДатаРождения = dt
        });
        res.render("list_pacients", {obj: rs});
        done();

        if(err){
          return console.log('error runing query', err);
        }
        console.log(result.rows)
      });
    });
  }
});

router.get("/list_pacients", function(req,res){
  var args = [];
  const text = 'SELECT * FROM "Pacient";';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      var rs =result.rows
      rs.forEach(function(element, index, array) {
        var dt = moment(new Date(element.ДатаРождения)).format("YYYY-MM-DD").toString();
        //console.log(dt);
        element.ДатаРождения = dt
      });
      res.render("list_pacients", {obj: rs});
      done();

      if(err){
        return console.log('error runing query', err);
      }
      //console.log(result.rows)
    });
  });
});

router.get("/list_doctors", function(req,res){
  var args = [];
  const text = 'SELECT * FROM "Doctor";';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      res.render("list_doctors", {obj: result.rows});
      done();

      if(err){
        return console.log('error runing query', err);
      }
      //console.log(result.rows)
    });
  });
});

router.delete('/list_pacients/:id', function(req, res){
  var args = [req.params.id];
  const text = 'DELETE FROM "Pacient" WHERE "@Pacient" = $1;';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      done();
      res.sendStatus(200);
      if(err){
        return console.log('error runing query', err);
      }
      console.log(result.rows)
    });
  });
});

router.delete('/list_doctors/:id', function(req, res){
  var args = [req.params.id];
  const text = 'DELETE FROM "Doctor" WHERE "@Doctor" = $1;';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      done();
      res.sendStatus(200);
      if(err){
        return console.log('error runing query', err);
      }
      console.log(result.rows)
    });
  });
});

router.post('/edit', urlEncodedParser, function(req, res){
  var args = [req.body.name, req.body.surname, req.body.pathr, req.body.dob, req.body.snils, req.body.id];
  console.log(args);
  const text = 'UPDATE "Pacient" SET "Имя" = $1, "Фамилия" = $2, "Отчетсво" = $3, "ДатаРождения" = $4::date, "СНИЛС" = $5 WHERE "@Pacient" = $6;';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      done();
      res.redirect('list_pacients');
      console.log('redirect');
      if(err){
        return console.log('error runing query', err);
      }
      console.log(result.rows)
    });
  });
});

router.post('/editDoctor', urlEncodedParser, function(req, res){
  var args = [req.body.name, req.body.surname, req.body.pathr, req.body.spec, req.body.id];
  console.log(args);
  const text = 'UPDATE "Doctor" SET "Имя" = $1, "Фамилия" = $2, "Отчетсво" = $3, "Специальность" = $4 WHERE "@Doctor" = $5;';
  pg.connect(connect, function(err, client, done){
    if(err){
      console.log('error fetching client from pool', err);
    }
    client.query(text, args, function(err, result){
      done();
      res.redirect('list_doctors');
      console.log('redirect');
      if(err){
        return console.log('error runing query', err);
      }
      console.log(result.rows)
    });
  });
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
