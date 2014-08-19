var DataCollection = require('./data_collection.js');

var characters = [
  {
    id: 1,
    first_name: 'Eddard',
    last_name: 'Stark',
    gender: 'm',
    age: 35,
    location: 'Winterfell'
  },
  {
    id: 2,
    first_name: 'Jon',
    last_name: 'Snow',
    gender: 'm',
    age: 14,
    location: 'Winterfell'
  },
  {
    id: 3,
    first_name: 'Catelyn',
    last_name: 'Stark',
    gender: 'f',
    age: 33,
    location: 'Winterfell'
  },
  {
    id: 4,
    first_name: 'Roose',
    last_name: 'Bolton',
    gender: 'm',
    age: 40,
    location: 'Dreadfort'
  },
  {
    id: 5,
    first_name: 'Ramsay',
    last_name: 'Snow',
    gender: 'm',
    age: 15,
    location: 'Dreadfort'
  }
];

var dc = new DataCollection(characters);

var oldAssert = console.assert.bind(console);
var count = 0;
var passed = 0;
console.assert = function(a, b) {
  count++;
  if(a) { passed++; }
  oldAssert(a, b);
};


console.assert((function() {
  var cur, keys, key;
  var result = dc.query().values();
  for(var i = 0, len = characters.length; i < len; i++) {
    var cur = characters[i];
    var keys = Object.keys(cur);
    for(var j = 0, jlen = keys.length; j < jlen; j++) {
      key = keys[j];
      if(cur[key] !== result[i][key]) { return false; }
    }
  }
  return true;
})(), 'Data loaded correctly');

console.assert((function() {
  var arr = dc.query().values('id');
  return (arr instanceof Array) && arr[0] === 1 && arr[1] === 2;
})(), '.values(key) gives array of items');

dc.defineIndex('id');

console.assert(dc.__index !== null, 'Index set properly');

console.assert(dc.exists(1), 'Index applied correctly');

dc.createMapping('is_bastard', function(row) { return row.last_name === 'Snow'; });

console.assert((function() {
  var result = dc.query().values();
  for(var i = 0, len = result.length; i < len; i++) {
    if(result[i].is_bastard !== (result[i].last_name === 'Snow')) {
      return false;
    }
  }
  return true;
})(), 'Mapping created successfully');

var newRow = {
  id: 6,
  first_name: 'Rob',
  last_name: 'Stark',
  gender: 'm',
  age: 14,
  location: 'Winterfell'
};

dc.insert(newRow);

console.assert((function () {
  var newResult = dc.query().last();
  return newResult !== newRow;
})(), 'Inserted data is not referential, awesome!');

console.assert((function () {
  var newResult = dc.query().last();
  var keys, key;
  keys = Object.keys(newRow);
  for(var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if(newResult[key] !== newRow[key]) {
      return false;
    }
  }
  return true;
})(), 'Insert added correct data');

console.assert(dc.query().last().is_bastard === false, 'Mapping worked for new row');

console.assert(dc.destroy(6).first_name === 'Rob', 'Destroy returned correct row');

console.assert(dc.query().count() === 5, 'Destroy eliminated record');

dc.truncate();

console.assert(dc.query().count() === 0, 'Truncation succeeded');

dc.load(characters);

console.assert(dc.query().count() === 5, 'External load succeeded');

console.assert((function() {
  var ok = true;
  var cur, keys, key;
  var result = dc.query().values();
  dc.query().each(function(row, i) {
    if(!ok) { return }
    var cur = characters[i];
    var keys = Object.keys(cur);
    for(var j = 0, jlen = keys.length; j < jlen; j++) {
      key = keys[j];
      if(cur[key] !== result[i][key]) { ok = false; }
    }
  });
  return ok;
})(), '.each executed properly');

console.assert(dc.query().filter({first_name: 'Jon'}).count() === 1, 'Filter __is gave correct number of rows');

console.assert(dc.query().filter({first_name: 'Jon'}).first().first_name === 'Jon', 'Filter __is worked');

console.assert(dc.query().filter({first_name__not: 'Jon'}).count() === 4, 'Filter __not gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({first_name__not: 'Jon'}).each(function(row) {
    if(!ok) { return; }
    ok = (row.first_name !== 'Jon');
  });
  return ok;
})(), 'Filter __not worked');

console.assert(dc.query().filter({age__gt: 33}).count() === 2, 'Filter __gt gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({age__gt: 33}).each(function(row) {
    if(!ok) { return; }
    ok = (row.age > 33);
  });
  return ok;
})(), 'Filter __gt worked');

console.assert(dc.query().filter({age__gte: 33}).count() === 3, 'Filter __gte gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({age__gte: 33}).each(function(row) {
    if(!ok) { return; }
    ok = (row.age >= 33);
  });
  return ok;
})(), 'Filter __gte worked');

console.assert(dc.query().filter({age__lt: 33}).count() === 2, 'Filter __lt gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({age__lt: 33}).each(function(row) {
    if(!ok) { return; }
    ok = (row.age < 33);
  });
  return ok;
})(), 'Filter __lt worked');

console.assert(dc.query().filter({age__lte: 33}).count() === 3, 'Filter __lte gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({age__lte: 33}).each(function(row) {
    if(!ok) { return; }
    ok = (row.age <= 33);
  });
  return ok;
})(), 'Filter __lte worked');

console.assert(dc.query().filter({first_name__icontains: 'R'}).count() === 3, 'Filter __icontains gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({first_name__icontains: 'R'}).each(function(row) {
    if(!ok) { return; }
    ok = (row.first_name.toLowerCase().indexOf('R'.toLowerCase()) > -1);
  });
  return ok;
})(), 'Filter __icontains worked');

console.assert(dc.query().filter({first_name__contains: 'R'}).count() === 2, 'Filter __contains gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({first_name__contains: 'R'}).each(function(row) {
    if(!ok) { return; }
    ok = (row.first_name.indexOf('R') > -1);
  });
  return ok;
})(), 'Filter __contains worked');

console.assert(dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}).count() === 2, 'Filter __in gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}).each(function(row) {
    if(!ok) { return; }
    ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) > -1;
  });
  return ok;
})(), 'Filter __in worked');

console.assert(dc.query().filter({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 3, 'Filter __not_in gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().filter({first_name__not_in: ['Catelyn', 'Eddard']}).each(function(row) {
    if(!ok) { return; }
    ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) === -1;
  });
  return ok;
})(), 'Filter __not_in worked');

console.assert(dc.query().exclude({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 2, 'Exclude gave correct number of rows');

console.assert((function() {
  var ok = true;
  dc.query().exclude({first_name__not_in: ['Catelyn', 'Eddard']}).each(function(row) {
    if(!ok) { return; }
    ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) > -1;
  });
  return ok;
})(), 'Exclude worked');

var dcSpawn = dc.query().spawn();

console.assert(dcSpawn instanceof DataCollection, 'Spawned DataCollection is an instance of DataCollection');

console.assert(dcSpawn.query().count() === dc.query().count(), 'Spawned DataCollection has identical count');

console.assert(dcSpawn.query().filter({id: 1}).first() !== dc.query().filter({id: 1}).first(), 'Spawned DataCollection is not referential to parent');

console.assert((function() {
  var ok = true;
  dcSpawn.query().each(function(row, i) {
    if(!ok) { return; }
    ok = dc.query().filter(row).count() === 1;
  })
  return ok;
})(), 'Spawned Data Collection does corresponds with parent values (potential filter failure on fail)');

console.assert(dcSpawn.query().filter({first_name: 'Ramsay'}).update({last_name: 'Bolton'}) &&
  (dcSpawn.query().filter({first_name: 'Ramsay'}).first().last_name === 'Bolton'), 'Update succeeded');

console.assert(dcSpawn.query().filter({first_name__in: ['Eddard', 'Catelyn']}).remove() &&
  dcSpawn.query().filter({first_name__in: ['Eddard', 'Catelyn']}).count() === 0, 'Remove got rid of expected rows');

var dcSpawn2 = dc.query().spawn(true);

console.assert(dcSpawn2.__index === null, 'Spawn with ignoreIndex successfully removed index');
console.assert(dcSpawn2.query().filter({id__not: 1}).remove() && dcSpawn2.query().count() === 1, 'Spawn without index removed rows successfully.');

console.assert(dc.query().sort('age').first().first_name === 'Jon', 'sort has correct first value (ASC)');
console.assert(dc.query().sort('age').last().first_name === 'Roose', 'sort has correct last value (ASC)');

console.assert(dc.query().sort('age', true).first().first_name === 'Roose', 'sort has correct first value (DESC)');
console.assert(dc.query().sort('age', true).last().first_name === 'Jon', 'sort has correct last value (DESC)');

console.assert(dc.query().max('age') === 40, 'Max gives correct value');

console.assert(dc.query().min('age') === 14, 'Min gives correct value');

console.assert(dc.query().sum('age') === (14 + 15 + 33 + 35 + 40), 'Sum gives correct value');

console.assert(dc.query().avg('age') === ((14 + 15 + 33 + 35 + 40) / 5), 'Avg gives correct value');

console.assert(dc.query().reduce('age', function(prev, cur) { return prev + cur; }) === (14 + 15 + 33 + 35 + 40), 'Reduce gives correct value');

console.assert(dc.query().distinct('location').length === 2, 'Distinct gives correct number of distinct values');

console.assert(dc.query().limit(2).count() === 2, 'Limit gives correct set size');

console.assert(dc.query().limit(1, 2).count() === 2, 'Limit w/ offset gives correct set size');

console.assert(dc.query().limit(1, 2).first().first_name === 'Jon', 'Limit offset gives correct value');

dcSpawn2.createMapping('is_bastard', function(row) { return row['last_name'] === 'Snow'; });
dcSpawn2.insert(newRow);

console.assert(dcSpawn2.query().filter({first_name: 'Rob'}).first().is_bastard === false, 'Create mapping works without index');

console.log('Passed ' + passed + ' of ' + count + ' tests. (' + Math.round((passed/count) * 100) + '%)');
