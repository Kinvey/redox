// proof-of-concept for Kinvey <-> Redox integration

// Redox API documentation:  https://www.redoxengine.com/#/docs/start/

var request = require('request');
var moment = require('moment');

var apiKey = "ea6d9715-ddf5-46fc-8d75-9237ee31e79d";
var secret = "sekret";
var template = require('./template.json');

// helper function
function login(apiKey, secret, callback) {
  var options = {
    url: 'https://api.redoxengine.com/auth/authenticate',
    method: "POST",
    json: true,
    form: { apiKey: apiKey, secret: secret}
  };
  request(options, function(error, response, body){
    console.log("logging in");
    if (!error && response.statusCode == 200) {
      //console.log("token:"+body.accessToken);
      callback(body.accessToken);
    } else {
      callback(null);
    }
  });
}

exports.getSummary = function(searchquery, callback) {
  console.log('inside getsummary');
  // get redox token
  login(apiKey, secret, function(token){

    // prepare template
    var redoxquery = JSON.parse(JSON.stringify(template));
    redoxquery.Meta.DataModel = "Clinical Summary";
    redoxquery.Meta.EventType = "Query";
    redoxquery.Meta.Destinations = [
          {
            ID: "ef9e7448-7f65-4432-aa96-059647e9b357",
            Name: "Clinical Summary Endpoint"
          }
        ];

    redoxquery.Patient.Identifiers = [
      {
        ID: "ffc486eff2b04b8^^^&1.3.6.1.4.1.21367.2005.13.20.1000&ISO",
        IDType: "NIST"
      }
    ];

    redoxquery.Meta.EventDateTime = moment().toISOString();
    //redoxquery.Patient.Demographics = searchquery;

    // run search
    var options = {
        url: 'https://api.redoxengine.com/query',
        method: "POST",
        json: true,
        headers: { Authorization: "Bearer "+token },
        body: redoxquery
    };

    request(options, function(error, response, body){
      console.log("getSummary querying on", JSON.stringify(redoxquery));
      console.log("summary output is ", body);
      if (!error && response.statusCode == 200 && body.Patient !== null) {
        // parse out results
        var result = body;//.Patient.Demographics;
    /*    body.Patient.Identifiers.forEach(function(item){
          if (item.IDType === "MR") result._id = item.ID
        });*/
        result._acl = {};
        result._kmd = { lmt: body.Meta.EventDateTime, ect: body.Meta.EventDateTime };

        // kinvey requires an array for queries
        var resarray = [];
        resarray.push(result);
        //console.log(result);
        callback(resarray);
      } else {
        console.log(body.Errors);
        callback([]);
      }
    });
  });
}

exports.searchPatient = function (searchquery, callback) {
  // get redox token
  login(apiKey, secret, function(token){

    // prepare template
    var redoxquery = JSON.parse(JSON.stringify(template));
    redoxquery.Meta.DataModel = "PatientSearch";
    redoxquery.Meta.EventType = "Query";
    redoxquery.Meta.Destinations = [
          {
            ID: "0f4bd1d1-451d-4351-8cfd-b767d1b488d6",
            Name: "Patient Search Endpoint"
          }
        ];

    redoxquery.Meta.EventDateTime = moment().toISOString();
    redoxquery.Patient.Demographics = searchquery;

    // run search
    var options = {
        url: 'https://api.redoxengine.com/query',
        method: "POST",
        json: true,
        headers: { Authorization: "Bearer "+token },
        body: redoxquery
    };
    request(options, function(error, response, body){
      console.log("patientSearch querying on", JSON.stringify(redoxquery));
      console.log("output is ", body);
      if (!error && response.statusCode == 200 && body.Patient !== null) {
        // parse out results
        var result = body.Patient.Demographics;
        body.Patient.Identifiers.forEach(function(item){
          if (item.IDType === "MR") result._id = item.ID
        });
        result._acl = {};
        result._kmd = { lmt: body.Meta.EventDateTime, ect: body.Meta.EventDateTime };

        // kinvey requires an array for queries
        var resarray = [];
        resarray.push(result);
        //console.log(result);
        callback(resarray);
      } else {
        console.log(body);
        callback([]);
      }
    });
  });
}


exports.patientAdmin = function (postbody, callback) {
  // get redox token
  login(apiKey, secret, function(token){

    // prepare template
    var redoxquery = JSON.parse(JSON.stringify(template));
    redoxquery.Meta.DataModel = "PatientAdmin";
    redoxquery.Meta.EventType = postbody.eventType;
    redoxquery.Meta.EventDateTime = moment().toISOString();

    redoxquery.Patient.Identifiers[0].ID = postbody._id;
    redoxquery.Patient.Demographics = postbody;
    redoxquery.Visit.PatientClass = "Inpatient";
    redoxquery.Visit.VisitDateTime = moment().toISOString();

    // run post
    var options = {
        url: 'https://api.redoxengine.com/endpoint',
        method: "POST",
        json: true,
        headers: { Authorization: "Bearer "+token },
        body: redoxquery
    };
    request(options, function(error, response, body){
      console.log("patientAdmin querying on", JSON.stringify(redoxquery));
      console.log("output is ", body);
      if (!error && response.statusCode == 200) {
        // parse out results
        var result = {};
        result._id = postbody._id;
        result.Message = body.Meta.Message.ID;
        result._acl = {};
        result._kmd = { lmt: moment().toISOString(), ect: moment().toISOString() };

        // kinvey requires an array for queries
        var resarray = [];
        resarray.push(result);
        //console.log(result);
        callback(resarray);
      } else {
        console.log(body);
        callback([]);
      }
    });
  });


}

