// redox integration

const sdk = require('kinvey-flex-sdk');
const redox = require('./redox.js');

console.log('starting redox poc');

setInterval(() => {
  console.log('periodic ping');
}, 60000); // just testing long running processes

sdk.service((err, flex) => {
  if (err) {
    console.log('error starting sdk service');
  } else {
    console.log('inside service');
  }

  const data = flex.data;   // gets the data object from the service
  function notImplementedHandler(request, complete) {
    complete('These methods are not implemented').notImplemented().done();
  }

  // set the serviceObject
  const patient = data.serviceObject('Patient');
  const summary = data.serviceObject('ClinicalSummary');

  summary.onGetByQuery((request, complete) => {
    console.log('inside clinical summary query');
    const demo = JSON.parse(request.query.query);
    console.log('starting getByQuery for ', demo);
    redox.getSummary(demo, (result) => complete(result).ok().next());
  });

  // wire up the event that we want to process
  patient.onGetByQuery((request, complete) => {
    const q = JSON.parse(request.query.query);
    console.log('starting getByQuery for ', q);
    redox.searchPatient(q, (result) => complete(result).ok().next());
  });

  patient.onUpdate((request, complete) => {
    console.log('starting onUpdate for ', request.body);
    redox.patientAdmin(request.body, (result) => complete(result).ok().next());
  });


  // wire up the events that we are not implementing
  patient.onGetById((request, complete) => {
    console.log('starting getById for ', request);
    const entityId = request.entityId;
    const entity = { _id: entityId, foo: 'bar' };

    return complete(entity).ok().next();
  });

  patient.onGetCount((request, complete) => {
    console.log('starting getCount for ', request);
    const count = { count: 1 };
    return complete(county).ok().next();
  });

  const flexFunctions = flex.functions;

  function paasCollectionOnPreSave(request, complete) {
    const entity = { sam: 25 };
    return complete(entity).ok().next();
  }

  flexFunctions.register('bizLogix', paasCollectionOnPreSave);

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

