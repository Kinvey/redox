
// test framework

var redox = require('./redox.js');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.get("/patient", function(request,response){
  //console.log(req.query.query)
  redox.searchPatient(JSON.parse(request.query.query), function(result){
    response.send(result);
  });
})

app.get("/ClinicalSummary", function(request,response){
  //console.log(req.query.query)
  redox.getSummary(JSON.parse(request.query.query), function(result){
    response.send(result);
  });
})

app.put("/patient/:id", function(request,response){
  console.log(request.body)
  redox.patientAdmin(request.body, function(result){
    response.send(result);
  });
})


app.listen(3000,function(){console.log("listening on :3000")});

/*
redox.searchPatient({
   "FirstName": "foo",
   "LastName": "bar",
   "DOB": "2001-01-01"
});


redox.searchPatient({
   "FirstName": "Timothy",
   "LastName": "Bixby",
   "DOB": "2008-01-06"
}, function(result){
  console.log(result);
});

*/
