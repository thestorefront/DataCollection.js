!function() {

  window.addEventListener('DOMContentLoaded', function() {

    QUnit.test('DataCollection Works', function(assert) {

      var characters = [
        {
          id: 1,
          first_name: 'Eddard',
          last_name: 'Stark',
          gender: 'm',
          age: 35,
          location: 'Winterfell',
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

      assert.ok((function() {
        try {
          dc.fetch(3);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to fetch without an index set');

      assert.ok((function() {
        try {
          dc.destroy(3);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to destroy without an index set');

      dc.defineIndex('id');

      assert.ok(dc.__index !== null, 'Index set properly');

      assert.ok(dc.exists(1), 'Index applied correctly');

      var destroyedRow = dc.destroy(3);

      assert.ok(destroyedRow.first_name === 'Catelyn', 'Destroyed proper result in middle of set');

      assert.ok((function() {
        try {
          dc.destroy(3);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to destroy already destroyed row');

      assert.ok(dc.__find__(destroyedRow) === -1, 'Could not find destroyed row');

      dc.removeIndex();

      assert.ok(dc.__index === null, 'Index removed properly');

      assert.ok((function() {
        try {
          dc.query().sequence(1, 5);
        } catch(e) {
          return true;
        }
        return false;
      })(), '.sequence gives error when not indexed');

      dc.defineIndex('id');

      dc.load();

      assert.ok(dc.query().count() === 0, 'Loaded an empty dataset correctly');

      assert.ok(dc.query().first() === null, 'First value of empty dataset returned null');

      assert.ok(dc.query().last() === null, 'Last value of empty dataset returned null');

      var oldQuery = dc.query().filter();

      dc.load(characters);

      assert.ok((function() {
        try {
          oldQuery.values();
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to get values from outdated DataCollectionQuery');

      assert.ok((function() {
        try {
          dc.query().filter({first_name__eats: 'names can\'t eat'});
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to use invalid filter type');

      assert.ok((function() {
        try {
          dc.query().each(null);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to use non-function for DataCollectionQuery.each');

      assert.ok(dc.query().count() === dc.query().filter().count(), 'Empty filter used empty object as filter params');

      assert.ok(dc.query().count() === dc.query().filter(null, null).count(), 'Filter given invalid arguments used empty objects as filter params');

      assert.ok((function() {
        try {
          dc.defineIndex(null);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to define non-string index');

      assert.ok((function() {
        try {
          dc.createMapping(null);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to create mapping with non-string key');

      assert.ok((function() {
        try {
          dc.createMapping('is_bastard', null);
        } catch(e) {
          return true;
        }
        return false;
      })(), 'As expected, failed (error) to create mapping with invalid function');

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

      assert.ok((function() {

        var seq = dc.query().sequence(5, 2, 3).values();
        var expect = [dc.fetch(5), dc.fetch(2), dc.fetch(3)];

        if(seq.length !== expect.length) { return false; }

        for(var i = 0, len = seq.length; i < len; i++) {
          if(seq[i] !== expect[i]) {
            return false;
          }
        }

        return true;

      })(), '.sequence gets correct values with argument overloading');

      assert.ok((function() {

        var seq = dc.query().sequence([5, 2, 3]).values();
        var expect = [dc.fetch(5), dc.fetch(2), dc.fetch(3)];

        if(seq.length !== expect.length) { return false; }

        for(var i = 0, len = seq.length; i < len; i++) {
          if(seq[i] !== expect[i]) {
            return false;
          }
        }

        return true;

      })(), '.sequence gets correct values with array of values');

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

      var updateRow = {
        id: 6,
        location: 'Winterfull'
      };

      dc.insert(updateRow);

      assert.ok(dc.query().count() === 6, 'Duplicate id inserted to replace old one');

      assert.ok(dc.query().last().location === 'Winterfull', 'Duplicate id overwrote old data');

      assert.ok(dc.query().last().first_name === 'Rob', '.insert kept old data that wasn\'t overwritten');

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

      assert.ok((function() {
        var ok = true;
        dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}, {age__in: [15, 40]}).each(function(row) {
          if(!ok) { return; }
          ok = (['Catelyn', 'Eddard'].indexOf(row.first_name) > -1 || [15, 40].indexOf(row.age) > -1);
        });
        return ok;
      })(), 'Filter with OR (separated values) worked');

      assert.ok(dc.query().filter({first_name__in: ['Catelyn', 'Eddard']}, {age__in: [15, 40]}).count() === 4, 'Filter with OR (separated objects) gave correct number of rows');

      assert.ok((function() {
        var first = dc.query().filter({age: 15}, {age: 40}, {age: 33}).values();
        var second = dc.query().filter({age__in: [15, 40, 33]}).values();
        if(first.length !== second.length) { return false; }
        for(var i = 0, len = first.length; i < len; i++) {
          if(first[i] !== second[i]) { return false; }
        }
        return true;
      })(), 'Filter with OR gave same values as __in for same field');

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

      var testSort = [
        {a: undefined, b: NaN},
        {a: null, b: 1E100},
        {a: NaN, b: {t: -1}},
        {a: -Infinity, b: 'xyz'},
        {a: -1E100, b: null},
        {a: -1, b: -1},
        {a: 0, b: Infinity},
        {a: 1, b: 'abc'},
        {a: new Date(1337), b: new Date(666)},
        {a: 1E100, b: false},
        {a: Infinity, b: {t: 1}},
        {a: false, b: -Infinity},
        {a: true, b: undefined},
        {a: new Date(666), b: new Date(1337)},
        {a: 'abc', b: function() {}},
        {a: 'xyz', b: true},
        {a: {t: -1}, b: 1},
        {a: {t: 1}, b: -1E100},
        {a: function() {}, b: 0}
      ];

      var dc3 = new DataCollection();
      dc3.load(testSort);

      assert.ok((function() {

        var order = [
          function() {}, {t: -1}, {t: 1}, new Date(666), new Date(1337), 'abc', 'xyz', false, true, -Infinity, -1E100, -1, 0, 1, 1E100, Infinity, NaN, null, undefined
        ];

        var test = dc3.query().sort('b').values('b');

        var c1, c2, keys1, keys2;

        for(var i = 0, len = order.length; i < len; i++) {
          c1 = order[i];
          c2 = test[i];
          if(c1 === c2) { continue; }
          if(typeof(c1) === 'number' && typeof(c2) === 'number') {
            if(isNaN(c1) && isNaN(c2)) { continue; }
          }
          if(typeof(c1) === 'object' && typeof(c2) === 'object') {
            if(c1 instanceof Date) {
              if(c2 instanceof Date) {
                if(c1.valueOf() === c2.valueOf()) { continue; }
                return false;
              }
              return false;
            }
            keys1 = Object.keys(c1);
            keys2 = Object.keys(c2);
            if(keys1.length === keys2.length) {
              for(var j = 0, jlen = keys1.length; j < jlen; j++) {
                if(!c2.hasOwnProperty(keys1[j])) { return false; }
                if(c1[keys1[j]] === c2[keys1[j]]) { continue; }
                return false;
              }
              continue;
            }
          }
          if(typeof(c1) === 'function' && typeof(c2) === 'function') {
            continue;
          }
          return false;
        }

        return true;

      })(), 'Sort orders correctly with all expected values (ASC)');

      assert.ok((function() {

        var order = [
          function() {}, {t: 1}, {t: -1}, new Date(1337), new Date(666), 'xyz', 'abc', true, false, Infinity, 1E100, 1, 0, -1, -1E100, -Infinity, NaN, null, undefined
        ];

        var test = dc3.query().sort('b', true).values('b');

        var c1, c2, keys1, keys2;

        for(var i = 0, len = order.length; i < len; i++) {
          c1 = order[i];
          c2 = test[i];
          if(c1 === c2) { continue; }
          if(typeof(c1) === 'number' && typeof(c2) === 'number') {
            if(isNaN(c1) && isNaN(c2)) { continue; }
          }
          if(typeof(c1) === 'object' && typeof(c2) === 'object') {
            if(c1 instanceof Date) {
              if(c2 instanceof Date) {
                if(c1.valueOf() === c2.valueOf()) { continue; }
                return false;
              }
              return false;
            }
            keys1 = Object.keys(c1);
            keys2 = Object.keys(c2);
            if(keys1.length === keys2.length) {
              for(var j = 0, jlen = keys1.length; j < jlen; j++) {
                if(!c2.hasOwnProperty(keys1[j])) { return false; }
                if(c1[keys1[j]] === c2[keys1[j]]) { continue; }
                return false;
              }
              continue;
            }
          }
          if(typeof(c1) === 'function' && typeof(c2) === 'function') {
            continue;
          }
          return false;
        }

        return true;

      })(), 'Sort orders correctly with all expected values (DESC)');

      var dc4 = new DataCollection();

      dc4.load([
        {
          a: {b: {c: 0}},
        },
        {
          a: {b: {c: 1}},
        },
        {
          a: {b: {c: 9}},
        },
        {
          a: {b: {c: -2}},
        },
        {
          a: {b: {c: 5}},
        }
      ]);

      assert.ok((function() {

        var vals = dc4.query().filter({'a__b__c__gte': 5}).values();
        var compare = [9, 5];

        for(var i = 0; i < compare.length; i++) {
          if(compare[i] !== vals[i].a.b.c) {
            return false;
          }
        }

        return true;

      })(), 'Filter by nested field successful');

      assert.ok((function() {

        try {
          var vals = dc4.query().filter({'a__d__b__gte': 5});
        } catch(e) {
          return true;
        }

        return false;

      })(), 'Filter throws error when related field does not exist');

      assert.ok((function() {

        var vals = dc4.query().filter({'a__b__c__lte': 5}).sort('a__b__c').values();
        var compare = [-2, 0, 1, 5];

        for(var i = 0; i < compare.length; i++) {
          if(compare[i] !== vals[i].a.b.c) {
            return false;
          }
        }

        return true;

      })(), 'Sort by nested field successful');

      assert.ok((function() {

        try {
          var vals = dc4.query().sort('a__d__b');
        } catch(e) {
          return true;
        }

        return false;

      })(), 'Sort throws error when nested field does not exist');

      var dc5 = new DataCollection();

      dc5.load([
        {a: '5'},
        {a: {}},
        {a: function() {}},
        {a: true},
        {a: false},
        {a: true},
        {a: 5},
        {a: '5'},
        {a: true},
        {a: '25'},
        {a: 25},
        {a: '25'},
        {a: 5},
        {a: null},
        {a: 'null'},
        {a: undefined},
        {a: undefined},
        {a: 'undefined'},
        {a: true},
        {a: 'null'},
        {a: NaN},
        {a: 'NaN'},
        {a: NaN}
      ]);

      assert.ok((function() {

        var test = [
          {},
          function() {},
          true,
          false,
          5,
          25,
          '5',
          '25',
          null,
          'null',
          undefined,
          'undefined',
          NaN,
          'NaN'
        ];

        var distinct = dc5.query().distinct('a');
        var val;
        var index;

        if(test.length !== distinct.length) {
          return false;
        }

        for(var i = 0, len = distinct.length; i < len; i++) {
          val = distinct[i];
          if(val !== val) {
            index = -1;
            for(var j = 0; j < test.length; j++) {
              if(test[j] !== test[j]) {
                index = j;
                break;
              }
            }
          } else if(val !== null && (typeof val === 'object' || typeof val === 'function')) {
            index = -1;
            for(var j = 0; j < test.length; j++) {
              if(typeof val === typeof test[j]) {
                index = j;
                break;
              }
            }
          } else {
            index = test.indexOf(val);
          }
          if(index > -1) {
            test.splice(index, 1);
          }
        }

        return !test.length;

      })(), 'Got distinct values (varying types) correctly');


      var dc6 = new DataCollection();

      dc6.load([
        {a: 0, b: 1, c: 2},
        {a: 3, b: 4, c: 5},
        {a: 6, b: 7, c: 8},
      ]);

      assert.ok(function() {

        var values = dc6.query().transform({d: 'a', e: 'b', f: function(row) { return row.a + row.b + row.c; }}).values();

        if(values.length !== 3) { return false; }

        var continueTest = true;

        continueTest && (values[0].d === 0) || (continueTest = false);
        continueTest && (values[0].e === 1) || (continueTest = false);
        continueTest && (values[0].f === 3) || (continueTest = false);
        delete values[0].d;
        delete values[0].e;
        delete values[0].f;
        (Object.keys(values[0]).length === 0) || (continueTest = false);

        continueTest && (values[1].d === 3) || (continueTest = false);
        continueTest && (values[1].e === 4) || (continueTest = false);
        continueTest && (values[1].f === 12) || (continueTest = false);
        delete values[1].d;
        delete values[1].e;
        delete values[1].f;
        (Object.keys(values[1]).length === 0) || (continueTest = false);

        continueTest && (values[2].d === 6) || (continueTest = false);
        continueTest && (values[2].e === 7) || (continueTest = false);
        continueTest && (values[2].f === 21) || (continueTest = false);
        delete values[2].d;
        delete values[2].e;
        delete values[2].f;
        (Object.keys(values[2]).length === 0) || (continueTest = false);

        return continueTest;

      }(), 'Properly transformed input data with strings and functions');

      assert.ok(function() {

        try {
          dc6.query().transform(null);
        } catch(e) {
          return true;
        }

      }(), 'Transform called with null throws error');

      assert.ok(function() {

        try {
          dc6.query().transform('string');
        } catch(e) {
          return true;
        }

      }(), 'Transform called with non-object throws error');

      assert.ok(function() {

        try {
          dc6.query().transform({lol: 'a', wat: function() {}, ok: null});
        } catch(e) {
          return true;
        }

      }(), 'Transform called with non-string and non-function mapping throws error');

      assert.ok(function() {

        var str = dc6.query().json();

        return str === '[{"a":0,"b":1,"c":2},{"a":3,"b":4,"c":5},{"a":6,"b":7,"c":8}]';

      }(), '.json() works correctly for objects');

      assert.ok(function() {

        var str = dc6.query().json('a');

        return str === '[0,3,6]';

      }(), '.json() works correctly for keys');

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
      var key = 'a';
      d.sort(function(a, b) {
        var val = 1;
        if(a[key] === b[key]) { return 0; }
        if(a[key] === undefined) { return -(val); }
        if(b[key] === undefined) { return (val); }
        if(a[key] === null) { return -(val); }
        if(b[key] === null) { return (val); }
        if(typeof a[key] === 'number') {
          if(typeof b[key] === 'number') {
            if(isNaN(a[key]) && isNaN(b[key])) { return 0; }
            if(isNaN(b[key])) { return (val); }
            return a[key] > b[key] ? (val) : -(val);
          }
          return -(val);
        }
        if(typeof a[key] === 'boolean') {
          if(typeof b[key] === 'number') { return (val); }
          if(typeof b[key] === 'boolean') { return a[key] > b[key] ? (val) : -(val); }
          return -(val);
        }
        if(typeof a[key] === 'string') {
          if(typeof b[key] === 'string') { return a[key] > b[key] ? (val) : -(val); }
          if(typeof b[key] === 'object') { return -(val); }
          if(typeof b[key] === 'function') { return -(val); }
          return (val);
        }
        if(typeof a[key] === 'object') {
          if(typeof b[key] === 'object') { return 0; }
          if(typeof b[key] === 'function') { return -(val); }
          return (val);
        }
        if(typeof a[key] === 'function') {
          if(typeof b[key] === 'function') { return 0; }
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
