
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var dbUrl = 'mongodb://127.0.0.1:27017/musica';
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;
//esta línea sirve para inicializar las vistas
app.set('view engine', 'jade');
//esta línea sirve para poder recoger todo lo que viene por post
app.use(bodyParser.urlencoded({extended: true}));

//Mapeos
//Inicio
app.get('/', function (req, res) {
  let datos = {};
  mongodb.connect(dbUrl, function(err, db){
      db.collection('artista').find().toArray(function(err, docs){
          datos.artista = docs
          console.log(datos);
          res.render('index', datos);
      });
  });
});

//Formulario para insertar Artista
app.get('/formulario-artista', function (req, res) {
  res.render('formularioArtista');
});


//Insertar Artista
//para post hay que hacer npm install body-parser --save
app.post('/inserta-artista', function (req, res) {
  //Inserto el artista
  mongodb.connect(dbUrl, function(err, db){     
      datos = {};
      let artista = {
        nombre: req.body.nombre,
        discografica: req.body.discografica,
        imagen: req.body.imagen
      }
      datos.artista = artista;
      //Insert
      db.collection('artista').insert(artista);
      //Carga la vista
      res.redirect("/"); 
  });
});


//Recibe el id del artista a modificar y carga sus datos en un formulario
app.get('/modificar-artista', function (req, res) {
  //Extracción de los datos necesarios de la url
  var id = req.query.id;  
  //Busca el artista
  mongodb.connect(dbUrl, function(err, db){
      db.collection('artista').find({"_id": new ObjectId(id)}).toArray(function(fff, doc) {
          datos = {};
          let artista = {
            _id:doc[0]._id,
            nombre:doc[0].nombre,
            discografica: doc[0].discografica,
            imagen: doc[0].imagen
          }
          datos.artista = artista;
          res.render('modificar-artista', datos);
      });      
  });
});

//Modificacion (Recibe los datos del usuario a modificar y lo modifica)
app.post('/index', function (req, res) {
  let artista = {
        _id: req.body._id,
        nombre: req.body.nombre,
        discografica: req.body.discografica,
        imagen: req.body.imagen
      }
  mongodb.connect(dbUrl, function(err, db){  
    //Update
    db.collection('artista').update({"_id": new ObjectId(artista._id)}, {$set: {nombre: artista.nombre, discografica: artista.discografica, imagen: artista.imagen}});   
  });
 res.redirect("/");  
});


//Borrado
app.get('/borrar-artista', function (req, res) {
  //Extracción de los datos necesarios de la url
  var id = req.query.id;  
  mongodb.connect(dbUrl, function(err, db){
      db.collection('artista').remove({"_id": new ObjectId(id)});
      res.redirect("/");
  });
});

//Discografia
app.get('/discografia', function (req, res) {
  //Extracción de los datos necesarios de la url
  var id = req.query.id;
  let datos = {};
  mongodb.connect(dbUrl, function(err, db){
      db.collection('disco').find({"idArtista": id}).toArray(function(err, docs){
          datos.disco = docs;
          datos.id = id;
          res.render('discografia', datos);
      });
  });
});

//Recibe el id del disco a modificar y carga sus datos en un formulario
app.get('/modificar-disco', function (req, res) {
  //Extracción de los datos necesarios de la url
  var id = req.query.id;
  //Busca el artista
  mongodb.connect(dbUrl, function(err, db){
      db.collection('disco').find({"_id": new ObjectId(id)}).toArray(function(fff, doc) {
          datos = {};
          let disco = {
            _id:doc[0]._id,
            nombre:doc[0].nombre,
            idArtista:doc[0].idArtista,
            anio: doc[0].anio,
            imagen: doc[0].imagen
          }
          datos.disco = disco;
          res.render('modificar-disco', datos);
      });      
  });
});
//Modificacion (Recibe los datos del disco a modificar y lo modifica)
app.post('/discografia', function (req, res) {
  let disco = {
        _id: req.body._id,
        nombre: req.body.nombre,
        anio: req.body.anio,
        imagen: req.body.imagen,
        idArtista: req.body.id
      }
  mongodb.connect(dbUrl, function(err, db){  
    //Update
    db.collection('disco').update({"_id": new ObjectId(disco._id)}, {$set: {nombre: disco.nombre, anio: disco.anio, imagen: disco.imagen, idArtista: disco.idArtista}});   
  });
 res.redirect("/discografia?id=" + disco.idArtista);  
});

//Formulario para insertar Disco
app.get('/formularioDisco', function (req, res) {
  var idArtista = req.query.idArtista;
  datos = {};
  datos.idArtista = idArtista;
  res.render('formularioDisco', datos);
});

//Insertar Disco
app.post('/inserta-disco', function (req, res) {
  //Inserto el disco
  mongodb.connect(dbUrl, function(err, db){     
      datos = {};
      let disco = {
        nombre: req.body.nombre,
        anio: req.body.anio,
        imagen: req.body.imagen,
        idArtista: req.body.idArtista
      }
      datos.disco = disco;
      //Insert
      db.collection('disco').insert(disco);
      //Carga la vista
      res.redirect("/discografia?id=" + req.body.idArtista); 
  });
});
//Borrado Disco
app.get('/borrar-disco', function (req, res) {
  //Extracción de los datos necesarios de la url
  var id = req.query.id;  
  var idArtista = req.query.idArtista;
  mongodb.connect(dbUrl, function(err, db){
      db.collection('disco').remove({"_id": new ObjectId(id)});
      res.redirect("/discografia?id=" + idArtista);
  });
});

//Busqueda
app.get('/buscar', function (req, res) {
  //Extracción de los datos necesarios de la url
  var nombre = req.query.nombre;  
  let datos = {};
  datos.artista = [];
  let i = 0;
  mongodb.connect(dbUrl, function(err, db){            
      db.collection('artista').find().toArray(function(err, docs){
          datos.artista = docs.filter(a => a.nombre.includes(nombre));
          /*for(let x = 0; x < docs.length; x++){
            if(docs[x].nombre.includes(nombre)){
              datos.artista[i] = docs[x];
              i++;
            }
          }*/
          res.render('index', datos);
      }); 
  });
   
});



app.listen(8080, function () {
  console.log('Servidor arrancado en http://localhost:8080');
});

