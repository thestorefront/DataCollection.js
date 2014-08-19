!function() {

  window.addEventListener('DOMContentLoaded', function() {

    // console.time('tests');
    // console.log('Running tests...');
    // var passed = 0;

    QUnit.test('DataCollection Works', function(assert) {

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


      assert.ok((function() {
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

      assert.ok((function() {
        var arr = dc.query().values('id');
        return (arr instanceof Array) && arr[0] === 1 && arr[1] === 2;
      })(), '.values(key) gives array of items');

      dc.defineIndex('id');

      assert.ok(dc.__index !== null, 'Index set properly');

      assert.ok(dc.exists(1), 'Index applied correctly');

      dc.createMapping('is_bastard', function(row) { return row.last_name === 'Snow'; });

      assert.ok((function() {
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

      assert.ok((function () {
        var newResult = dc.query().last();
        return newResult !== newRow;
      })(), 'Inserted data is not referential, awesome!');

      assert.ok((function () {
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

      assert.ok(dc.query().last().is_bastard === false, 'Mapping worked for new row');

      assert.ok(dc.destroy(6).first_name === 'Rob', 'Destroy returned correct row');

      assert.ok(dc.query().count() === 5, 'Destroy eliminated record');

      dc.truncate();

      assert.ok(dc.query().count() === 0, 'Truncation succeeded');

      dc.load(characters);

      assert.ok(dc.query().count() === 5, 'External load succeeded');

      assert.ok((function() {
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

      assert.ok(dc.query().filter({first_name: 'Jon'}).count() === 1, 'Filter __is gave correct number of rows');

      assert.ok(dc.query().filter({first_name: 'Jon'}).first().first_name === 'Jon', 'Filter __is worked');

      assert.ok(dc.query().filter({first_name__not: 'Jon'}).count() === 4, 'Filter __not gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__not: 'Jon'}).each(function(row) {
          if(!ok) { return; }
          ok = (row.first_name !== 'Jon');
        });
        return ok;
      })(), 'Filter __not worked');

      assert.ok(dc.query().filter({age__gt: 33}).count() === 2, 'Filter __gt gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({age__gt: 33}).each(function(row) {
          if(!ok) { return; }
          ok = (row.age > 33);
        });
        return ok;
      })(), 'Filter __gt worked');

      assert.ok(dc.query().filter({age__gte: 33}).count() === 3, 'Filter __gte gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({age__gte: 33}).each(function(row) {
          if(!ok) { return; }
          ok = (row.age >= 33);
        });
        return ok;
      })(), 'Filter __gte worked');

      assert.ok(dc.query().filter({age__lt: 33}).count() === 2, 'Filter __lt gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({age__lt: 33}).each(function(row) {
          if(!ok) { return; }
          ok = (row.age < 33);
        });
        return ok;
      })(), 'Filter __lt worked');

      assert.ok(dc.query().filter({age__lte: 33}).count() === 3, 'Filter __lte gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({age__lte: 33}).each(function(row) {
          if(!ok) { return; }
          ok = (row.age <= 33);
        });
        return ok;
      })(), 'Filter __lte worked');

      assert.ok(dc.query().filter({first_name__icontains: 'R'}).count() === 3, 'Filter __icontains gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__icontains: 'R'}).each(function(row) {
          if(!ok) { return; }
          ok = (row.first_name.toLowerCase().indexOf('R'.toLowerCase()) > -1);
        });
        return ok;
      })(), 'Filter __icontains worked');

      assert.ok(dc.query().filter({first_name__contains: 'R'}).count() === 2, 'Filter __contains gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__contains: 'R'}).each(function(row) {
          if(!ok) { return; }
          ok = (row.first_name.indexOf('R') > -1);
        });
        return ok;
      })(), 'Filter __contains worked');

      assert.ok(dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}).count() === 2, 'Filter __in gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}).each(function(row) {
          if(!ok) { return; }
          ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) > -1;
        });
        return ok;
      })(), 'Filter __in worked');

      assert.ok(dc.query().filter({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 3, 'Filter __not_in gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__not_in: ['Catelyn', 'Eddard']}).each(function(row) {
          if(!ok) { return; }
          ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) === -1;
        });
        return ok;
      })(), 'Filter __not_in worked');

      assert.ok(dc.query().exclude({first_name__not_in: ['Catelyn', 'Eddard']}).count() === 2, 'Exclude gave correct number of rows');

      assert.ok((function() {
        var ok = true;
        dc.query().exclude({first_name__not_in: ['Catelyn', 'Eddard']}).each(function(row) {
          if(!ok) { return; }
          ok = ['Catelyn', 'Eddard'].indexOf(row.first_name) > -1;
        });
        return ok;
      })(), 'Exclude worked');

      var dcSpawn = dc.query().spawn();

      assert.ok(dcSpawn instanceof DataCollection, 'Spawned DataCollection is an instance of DataCollection');

      assert.ok(dcSpawn.query().count() === dc.query().count(), 'Spawned DataCollection has identical count');

      assert.ok(dcSpawn.query().filter({id: 1}).first() !== dc.query().filter({id: 1}).first(), 'Spawned DataCollection is not referential to parent');

      assert.ok((function() {
        var ok = true;
        dcSpawn.query().each(function(row, i) {
          if(!ok) { return; }
          ok = dc.query().filter(row).count() === 1;
        })
        return ok;
      })(), 'Spawned Data Collection does corresponds with parent values (potential filter failure on fail)');

      assert.ok(dcSpawn.query().filter({first_name: 'Ramsay'}).update({last_name: 'Bolton'}) &&
        (dcSpawn.query().filter({first_name: 'Ramsay'}).first().last_name === 'Bolton'), 'Update succeeded');

      assert.ok(dcSpawn.query().filter({first_name__in: ['Eddard', 'Catelyn']}).remove() &&
        dcSpawn.query().filter({first_name__in: ['Eddard', 'Catelyn']}).count() === 0, 'Remove got rid of expected rows');

      var dcSpawn2 = dc.query().spawn(true);

      assert.ok(dcSpawn2.__index === null, 'Spawn with ignoreIndex successfully removed index');
      assert.ok(dcSpawn2.query().filter({id__not: 1}).remove() && dcSpawn2.query().count() === 1, 'Spawn without index removed rows successfully.');

      assert.ok(dc.query().sort('age').first().first_name === 'Jon', 'sort has correct first value (ASC)');
      assert.ok(dc.query().sort('age').last().first_name === 'Roose', 'sort has correct last value (ASC)');

      assert.ok(dc.query().sort('age', true).first().first_name === 'Roose', 'sort has correct first value (DESC)');
      assert.ok(dc.query().sort('age', true).last().first_name === 'Jon', 'sort has correct last value (DESC)');

      assert.ok(dc.query().max('age') === 40, 'Max gives correct value');

      assert.ok(dc.query().min('age') === 14, 'Min gives correct value');

      assert.ok(dc.query().sum('age') === (14 + 15 + 33 + 35 + 40), 'Sum gives correct value');

      assert.ok(dc.query().avg('age') === ((14 + 15 + 33 + 35 + 40) / 5), 'Avg gives correct value');

      assert.ok(dc.query().reduce('age', function(prev, cur) { return prev + cur; }) === (14 + 15 + 33 + 35 + 40), 'Reduce gives correct value');

      assert.ok(dc.query().distinct('location').length === 2, 'Distinct gives correct number of distinct values');

      assert.ok(dc.query().limit(2).count() === 2, 'Limit gives correct set size');

      assert.ok(dc.query().limit(1, 2).count() === 2, 'Limit w/ offset gives correct set size');

      assert.ok(dc.query().limit(1, 2).first().first_name === 'Jon', 'Limit offset gives correct value');

      dcSpawn2.createMapping('is_bastard', function(row) { return row['last_name'] === 'Snow'; });
      dcSpawn2.insert(newRow);

      assert.ok(dcSpawn2.query().filter({first_name: 'Rob'}).first().is_bastard === false, 'Create mapping works without index');

    });

    var rows = 100000;
    console.log('Creating benchmark dataset (' + rows + ' rows)');
    console.time('create');

    var data = Array(rows);
    for(var i = 0, len = data.length; i < len; i++) {
      data[i] = {
        a: Math.random(),
        b: String.fromCharCode(65 + Math.round((Math.random() * 25))),
        c: (Math.random() * 2) | 0,
        d: ['one', 'two', 'three'][(Math.random() * 3) | 0],
        e: (Math.random() * 1000) | 0,
        f: null
      };
    }

    console.timeEnd('create');

    console.log('Loading DataCollection (' + rows + ' rows)');
    var dc = new DataCollection();
    console.time('load');
    dc.load(data);
    console.timeEnd('load');

    var i;
    i = 3;
    while(i--) {
      console.time('filter native');
      data.filter(function(v) {
        return v.a > 0.5;
      });
      var x = console.timeEnd('filter native');
    }

    i = 3;
    while(i--) {
      console.time('filter dc');
      dc.query().filter({a__gt: 0.5});
      console.timeEnd('filter dc');
    }

    i = 3;
    while(i--) {
      console.time('filter native complex');
      data.filter(function(v) {
        return v.a > 0.2 && (v.d === 'one' || v.d === 'three') && v.f === null && v.c === 1;
      });
      console.timeEnd('filter native complex');
    }

    i = 3;
    while(i--) {
      console.time('filter dc complex');
      dc.query().filter({a__gt: 0.2, d__in: ['one, three'], f: null, c: 1});
      console.timeEnd('filter dc complex');
    }

    i = 3;
    while(i--) {
      var d = data.slice();
      console.time('sort native');
      d.sort(function(a, b) {
        var val = 1;
        if(a.a === b.a) { return 0; }
        if(a.a === null) { return -(val); }
        if(b.a === null) { return (val); }
        if(typeof a.a === 'number') {
          if(typeof b.a === 'number') {
            if(isNaN(a.a) && isNaN(b.a)) { return 0; }
            if(isNaN(b.a)) { return (val); }
            return a.a > b.a ? (val) : -(val);
          }
          if(typeof b.a === 'boolean') { return -(val); }
          if(typeof b.a === 'string') { return -(val); }
          if(typeof b.a === 'object') { return -(val); }
        }
        if(typeof a.a === 'boolean') {
          if(typeof b.a === 'number') { return (val); }
          if(typeof b.a === 'boolean') { return a.a > b.a ? (val) : -(val); }
          if(typeof b.a === 'string') { return -(val); }
          if(typeof b.a === 'object') { return -(val); }
        }
        if(typeof a.a === 'string') {
          if(typeof b.a === 'number') { return (val); }
          if(typeof b.a === 'boolean') { return (val); }
          if(typeof b.a === 'string') { return a.a > b.a ? (val) : -(val); }
          if(typeof b.a === 'object') { return -(val); }
        }
        if(typeof a.a === 'object') {
          if(typeof b.a === 'object') { return 0; }
          return (val);
        }
        return 0;
      });
      console.timeEnd('sort native');
    }

    i = 3;
    while(i--) {
      console.time('sort dc');
      dc.query().sort('a');
      console.timeEnd('sort dc');
    }

    i = 3;
    while(i--) {
      var d = data.slice();
      console.time('sort native null');
      d.sort(function(a, b) {
        var val = 1;
        if(a.f === b.f) { return 0; }
        if(a.f === null) { return -(val); }
        if(b.f === null) { return (val); }
        if(typeof a.f === 'number') {
          if(typeof b.f === 'number') {
            if(isNaN(a.f) && isNaN(b.f)) { return 0; }
            if(isNaN(b.f)) { return (val); }
            return a.f > b.f ? (val) : -(val);
          }
          if(typeof b.f === 'boolean') { return -(val); }
          if(typeof b.f === 'string') { return -(val); }
          if(typeof b.f === 'object') { return -(val); }
        }
        if(typeof a.f === 'boolean') {
          if(typeof b.f === 'number') { return (val); }
          if(typeof b.f === 'boolean') { return a.f > b.f ? (val) : -(val); }
          if(typeof b.f === 'string') { return -(val); }
          if(typeof b.f === 'object') { return -(val); }
        }
        if(typeof a.f === 'string') {
          if(typeof b.f === 'number') { return (val); }
          if(typeof b.f === 'boolean') { return (val); }
          if(typeof b.f === 'string') { return a.f > b.f ? (val) : -(val); }
          if(typeof b.f === 'object') { return -(val); }
        }
        if(typeof a.f === 'object') {
          if(typeof b.f === 'object') { return 0; }
          return (val);
        }
        return 0;
      });
      console.timeEnd('sort native null');
    }

    i = 3;
    while(i--) {
      console.time('sort dc null');
      dc.query().sort('f');
      console.timeEnd('sort dc null');
    }

  });

}(window);
