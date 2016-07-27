// redox integration

var sdk = require('kinvey-backend-sdk');
var redox = require('./redox.js');

console.log("starting redox poc");
setInterval(function(){console.log("periodic ping")},60000); // just testing long running processes

var service = sdk.service(function(err, service) {
  if (err)
    console.log("error starting sdk service");
  else
    console.log("inside service");

  var dataLink = service.dataLink;   // gets the datalink object from the service
  var notImplementedHandler = function(request, complete) {
    complete("These methods are not implemented").notImplemented().done();
  };

  // set the serviceObject
  var patient = dataLink.serviceObject('Patient');
  var summary = dataLink.serviceObject('ClinicalSummary');

  summary.onGetByQuery(function(request, complete) {
    console.log('inside clinical summary query');
    var demo = JSON.parse(request.query.query);
    console.log("starting getByQuery for ",demo);
    redox.getSummary(demo, function(result){
      return complete(result).ok().next();
    });
  });

  // wire up the event that we want to process
  patient.onGetByQuery(function(request, complete) {
    var q = JSON.parse(request.query.query);
    console.log("starting getByQuery for ",q);
    redox.searchPatient(q, function(result){
      return complete(result).ok().next();
    });
  });

  patient.onUpdate(function(request, complete) {
    console.log("starting onUpdate for ",request.body);
    redox.patientAdmin(request.body, function(result){
      return complete(result).ok().next();
    });
  });


  // wire up the events that we are not implementing
  patient.onGetById(function(request, complete) {
    console.log("starting getById for ",request);
    var entityId = request.entityId;
    var entity = { _id:entityId, foo:"bar"};

    return complete(entity).ok().next();
  });

  patient.onGetCount(function(request, complete) {
    console.log("starting getCount for ",request);
    var count = {count:1};
    return complete(county).ok().next();
  });

  var bizLogic = service.businessLogic;

  
  var paasCollectionOnPreSave = function(request, complete) {
    var entity = { "sam": 25 };
    return complete(entity).ok().next();
  };

  bizLogic.register('bizLogix', paasCollectionOnPreSave);

  patient.onGetAll(notImplementedHandler);
  patient.onInsert(notImplementedHandler);
  patient.onDeleteAll(notImplementedHandler);
  patient.onDeleteByQuery(notImplementedHandler);
  patient.onDeleteById(notImplementedHandler);
  summary.onGetAll(notImplementedHandler);
  summary.onInsert(notImplementedHandler);
  summary.onDeleteAll(notImplementedHandler);
  summary.onDeleteByQuery(notImplementedHandler);
  summary.onDeleteById(notImplementedHandler);
  summary.onUpdate(notImplementedHandler);
  summary.onGetById(notImplementedHandler);
  summary.onGetCount(notImplementedHandler);
});

