module.exports = DataCollection;

function DataCollection(data) {

  this.__index = null;
  this.__instance = null;
  this.__map = Object.create(null);

  this.load(data);

};

DataCollection.prototype.__instances = 0;

DataCollection.prototype.__increment__ = function() {

  this.__instance = this.constructor.prototype.__instances++;

};

DataCollection.prototype.__uniqid__ = function() {

  return this.__uniqid++;

};

DataCollection.prototype.__find__ = function(row) {

  var data = this._data;
  var len = data.length;

  if(data[len >>> 1] === row) {
    return len >>> 1;
  }

  for(var i = 0; i < (len >>> 1); i++) {
    if(data[i] === row) { return i; }
    if(data[len - i - 1] === row) { return len - i - 1; }
  }

  return -1;

};

DataCollection.prototype.__prepare__ = function(data) {

  var newData = Array(data.length);
  var n = 0;
  var row;
  var keys = [];
  var key;
  var keyLength;

  var index = this.__index;
  var indexedRows = this.__indexedRows;

  var mapFuncs = this.__map;
  var mapKeys = [];
  var mapKey;
  var mapLength;

  if(data.length && typeof data[0] === 'object' && data[0] !== null) {
    keys = Object.keys(data[0]);
  }
  keyLength = keys.length;

  mapKeys = Object.keys(this.__map);
  mapLength = mapKeys.length;

  if(!index) {

    for(var i = 0, len = data.length; i < len; i++) {
      row = data[i];
      if(!row || typeof row !== 'object') { continue; }
      var newRow = Object.defineProperty(Object.create(null), '__uniqid__', {value: this.__uniqid__()});

      keys = Object.keys(row);
      keyLength = keys.length;

      /* Fill keys */
      for(var j = 0; j < keyLength; j++) {
        key = keys[j];
        newRow[key] = row[key];
      }

      /* Add necessary mappings */
      for(var j = 0; j < mapLength; j++) {
        mapKey = mapKeys[j];
        newRow[mapKey] = mapFuncs[mapKey].call(this, newRow);
      }

      newData[n++] = newRow;

    }

  } else {

    for(var i = 0, len = data.length; i < len; i++) {
      row = data[i];
      if(!row || typeof row !== 'object') { continue; }
      var newRow = indexedRows[row[index]] || (newData[n++] = Object.defineProperty(Object.create(null), '__uniqid__', {value: this.__uniqid__()}));

      keys = Object.keys(row);
      keyLength = keys.length;

      /* Fill keys */
      for(var j = 0; j < keyLength; j++) {
        key = keys[j];
        newRow[key] = row[key];
      }

      /* Add necessary mappings */
      for(var j = 0; j < mapLength; j++) {
        mapKey = mapKeys[j];
        newRow[mapKey] = mapFuncs[mapKey].call(this, newRow);
      }

      indexedRows[newRow[index]] = newRow;

    }

  }

  newData = newData.slice(0, n);

  return newData;

};

DataCollection.prototype.defineIndex = function(key) {

  if(typeof key !== 'string') {
    throw new Error('Must have a valid string as an index parameter');
  }

  this.__index = key + '';

  var index = key;
  var indexedRows = Object.create(null);
  var data = this._data;

  for(var i = 0, len = data.length; i < len; i++) {
    indexedRows[data[i][index]] = data[i];
  }

  this.__indexedRows = indexedRows;

  return this;

};

DataCollection.prototype.removeIndex = function() {

  this.__index = null;
  this.__indexedRows = Object.create(null);

};

DataCollection.prototype.createMapping = function(key, fnMap) {

  if(typeof key !== 'string') {
    throw new Error('Must have a valid string as an key parameter for mapping');
  }

  if(typeof fnMap !== 'function') {
    throw new Error('Mapping function must be a valid function');
  }

  this.__map[key] = fnMap;

  /* Add map to everything */
  var data = this._data;
  for(var i = 0, len = data.length; i < len; i++) {
    var row = data[i];
    row[key] = fnMap.call(this, row);
  }

  return this;

};

DataCollection.prototype.exists = function(indexedValue) {

  return !!this.fetch(indexedValue);

};

DataCollection.prototype.fetch = function(indexedValue) {

  if(this.__index === null) {
    throw new Error('No index defined on DataCollection');
  }

  return this.__indexedRows[indexedValue] || null;

};

DataCollection.prototype.destroy = function(indexedValue) {

  if(this.__index === null) {
    throw new Error('No index defined on DataCollection');
  }

  var row = this.__indexedRows[indexedValue];

  if(!row) {
    throw new Error('Can not destroy, index does not exist');
  }

  var a = this.__find__(row);
  this._data.splice(this.__find__(row), 1);
  delete this.__indexedRows[indexedValue];

  this.__increment__();

  return row;

};

DataCollection.prototype.__remove__ = function(removeSize) {

  var data = this._data;
  var row;
  var sz = -1;
  var index = this.__index;
  var indexedRows = {};
  var newData = Array(data.length - removeSize);

  if(index === null) {
    for(var i = 0, len = data.length; i < len; i++) {
      row = data[i];
      if(!row['__remove__']) {
        newData[++sz] = row;
      }
    }
  } else {
    for(var i = 0, len = data.length; i < len; i++) {
      row = data[i];
      if(!row['__remove__']) {
        newData[++sz] = row;
        indexedRows[row[index]] = row;
      }
    }
    this.__indexedRows = indexedRows;
  }

  this._data = newData;

  this.__increment__();

  return true;

};

DataCollection.prototype.insert = function(data) {

  if(!(data instanceof Array)) {
    data = [].slice.call(arguments);
  }

  this._data = this._data.concat(this.__prepare__(data));

  this.__increment__();

  return true;

};

DataCollection.prototype.load = function(data) {

  if(!(data instanceof Array)) {
    data = [].slice.call(arguments);
  }

  this.__indexedRows = Object.create(null);
  this.__uniqid = 0;
  this._data = this.__prepare__(data);
  this.__increment__();

  return true;

};

DataCollection.prototype.truncate = function(data) {

  this.__indexedRows = Object.create(null);
  this.__uniqid = 0;
  this._data = [];
  this.__increment__();

  return true;

};

DataCollection.prototype.query = function() {

  return new DataCollectionQuery(this, this._data.slice());

};

/*
  DataCollectionQuery
    Can only be constructed via DataCollection
*/

function DataCollectionQuery(parent, data) {

  this.__parent = parent;
  this.__parentInstance = parent.__instance;

  this._data = data

};

DataCollectionQuery.prototype.__validate__ = function() {

  if(this.__parent === null) { return; }

  if(this.__parent.__instance !== this.__parentInstance) {
    throw new Error('Invalid DataCollection query, parent has been modified');
  }

};

DataCollectionQuery.prototype.__compare = {
  'is': function(a, b) { return a === b; },
  'not': function(a, b) { return a !== b; },
  'gt': function(a, b) { return a > b; },
  'lt': function(a, b) { return a < b; },
  'gte': function(a, b) { return a >= b; },
  'lte': function(a, b) { return a <= b; },
  'icontains': function(a, b) { return a.toLowerCase().indexOf(b.toLowerCase()) > -1; },
  'contains': function(a, b) { return a.indexOf(b) > -1; },
  'in': function(a, b) { return b.indexOf(a) > -1; },
  'not_in': function(a, b) { return b.indexOf(a) === -1; }
};

DataCollectionQuery.prototype.__filter = function(filterArray, exclude) {

  this.__validate__();

  exclude = !!exclude;

  for(var i = 0, len = filterArray.length; i < len; i++) {
    if(typeof filterArray[i] !== 'object' || filterArray[i] === null) {
      filterArray[i] = {};
    }
  }

  if(!filterArray.length) {
    filterArray = [{}];
  }

  var data = this._data.slice();
  var filters, keys, key, filterData, filter, filterType;
  var filterArrayLength = filterArray.length;
  var f, i, j, k;

  for(f = 0; f !== filterArrayLength; f++) {

    filters = filterArray[f];
    keys = Object.keys(filters);

    filterData = [];

    for(i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      filter = key.split('__');
      if(filter.length < 2) {
        filter.push('is');
      }
      filterType = filter.pop();

      if(!this.__compare[filterType]) {
        throw new Error('Filter type "' + filterType + '" not supported.');
      }
      filterData.push([this.__compare[filterType], filter, filters[key]]);
    }

    filterArray[f] = filterData;

  }

  var tmpFilter;
  var compareFn, key, val, datum;

  var filterData;
  var filterLength;
  var len = data.length;

  var excludeCurrent;
  var n = 0;
  var tmp = Array(len);

  var flen = 0;
  var d;

  try {

    for(i = 0; i !== len; i++) {

      datum = data[i];
      excludeCurrent = true;

      for(j = 0; j !== filterArrayLength && excludeCurrent; j++) {

        excludeCurrent = false;
        filterData = filterArray[j];
        filterLength = filterData.length;

        for(k = 0; k !== filterLength && !excludeCurrent; k++) {

          tmpFilter = filterData[k];
          compareFn = tmpFilter[0];
          d = datum;
          key = tmpFilter[1];
          for(f = 0, flen = key.length; f !== flen; f++) {
            d = d[key[f]];
          }
          val = tmpFilter[2];
          (compareFn(d, val) === exclude) && (excludeCurrent = true);

        }

        !excludeCurrent && (tmp[n++] = datum);

      }

    }

  } catch(e) {

    throw new Error('Nested field ' + key.join('__') + ' does not exist');

  }

  tmp = tmp.slice(0, n);

  return new DataCollectionQuery(this.__parent, tmp);

};

DataCollectionQuery.prototype.filter = function(filters) {
  var filterArray = [].slice.call(arguments);
  return this.__filter(filterArray, false);
};

DataCollectionQuery.prototype.exclude = function(filters) {
  var filterArray = [].slice.call(arguments);
  return this.__filter(filterArray, true);
};

DataCollectionQuery.prototype.spawn = function(ignoreIndex) {

  this.__validate__();

  var dc = new DataCollection(this._data);
  if(ignoreIndex) { return dc; }
  if(this.__parent.__index) { dc.defineIndex(this.__parent.__index); }
  return dc;

};

DataCollectionQuery.prototype.each = function(callback) {

  if(typeof callback !== 'function') {
    throw new Error('DataCollectionQuery.each expects a callback');
  }

  var data = this._data;
  for(var i = 0, len = data.length; i < len; i++) {
    callback.call(this, data[i], i);
  }

  return this;

};

DataCollectionQuery.prototype.update = function(fields) {

  this.__validate__();

  var keys = Object.keys(fields);
  var key;
  var fieldLength = keys.length;

  for(var i = 0; i < fieldLength; i++) {
    key = keys[i];
    keys[i] = [key, fields[key]];
  }

  var data = this._data;
  for(var i = 0, len = data.length; i < len; i++) {
    var row = data[i];
    for(var j = 0; j < fieldLength; j++) {
      key = keys[j];
      row[key[0]] = key[1];
    }
  }

  return this;

};

DataCollectionQuery.prototype.remove = function() {
  this.__validate__();
  this.update({__remove__: true});
  return this.__parent.__remove__(this.count());
};

DataCollectionQuery.prototype.order = function(key, orderDesc) {

  this.__validate__();

  key = (key + '').replace(/[^A-Za-z0-9-_]/gi, '?');
  var originalKey = key;

  key = '[\'' + key.split('__').join('\'][\'') + '\']';

  orderDesc = !!orderDesc;

  var sortFn = new Function(
    'a',
    'b',
    [
      'var val = ' + (orderDesc ? -1 : 1) + ';',
      'var a__uniq = a.__uniqid__',
      'var b__uniq = b.__uniqid__',
      'a = a' + key + ';',
      'b = b' + key + ';',
      'if(a === b) { return a__uniq > b__uniq ? (val) : -(val); }',
      'if(a === undefined) { return 1; }',
      'if(b === undefined) { return -1; }',
      'if(a === null) { return 1; }',
      'if(b === null) { return -1; }',
      'if(typeof a === \'function\') {',
      '  if(typeof b === \'function\') { return a__uniq > b__uniq ? (val) : -(val); }',
      '  return -1;',
      '}',
      'if(typeof a === \'object\') {',
      '  if(typeof b === \'function\') { return 1; }',
      '  if(typeof b === \'object\') {',
      '    if(a instanceof Date && b instanceof Date) {',
      '        return a.valueOf() > b.valueOf() ? (val) : -(val);',
      '    }',
      '    if(a instanceof Date) { return 1; }',
      '    if(b instanceof Date) { return -1; }',
      '    return a__uniq > b__uniq ? (val) : -(val);',
      '  }',
      '  return -1;',
      '}',
      'if(typeof a === \'string\') {',
      '  if(typeof b === \'function\') { return 1; }',
      '  if(typeof b === \'object\') { return 1; }',
      '  if(typeof b === \'string\') { return a > b ? (val) : -(val); }',
      '  return -1;',
      '}',
      'if(typeof a === \'boolean\') {',
      '  if(typeof b === \'boolean\') { return a > b ? (val) : -(val); }',
      '  if(typeof b === \'number\') { return -1; }',
      '  return 1;',
      '}',
      'if(typeof a === \'number\') {',
      '  if(typeof b === \'number\') {',
      '    if(isNaN(a) && isNaN(b)) { return a__uniq > b__uniq ? (val) : -(val); }',
      '    if(isNaN(a)) { return 1; }',
      '    if(isNaN(b)) { return -1; }',
      '    return a > b ? (val) : -(val);',
      '  }',
      '  return 1;',
      '}',
      'return a__uniq > b__uniq ? (val) : -(val);'
    ].join('\n')
  );

  try {
    var tmp = this._data.slice().sort(sortFn);
  } catch(e) {
    throw new Error('Key ' + originalKey + ' could not be sorted by');
  }

  return new DataCollectionQuery(this.__parent, tmp);

};

DataCollectionQuery.prototype.sort = DataCollectionQuery.prototype.order;

DataCollectionQuery.prototype.values = function(key) {

  this.__validate__();

  if(!key) { return this._data.slice(); }

  var data = this._data;
  var len = data.length;
  var tmp = Array(len);
  for(var i = 0; i < len; i++) {
    tmp[i] = data[i][key];
  }

  return tmp;

};

DataCollectionQuery.prototype.max = function(key) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var curMax = null;
  var curVal;

  if(!len) { return 0; }

  curMax = data[0][key];

  for(var i = 1; i < len; i++) {
    curVal = data[i][key];
    if(curVal > curMax) {
      curMax = curVal;
    }
  }

  return curMax;

};

DataCollectionQuery.prototype.min = function(key) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var curMin = null;
  var curVal;

  if(!len) { return 0; }

  curMin = data[0][key];

  for(var i = 1; i < len; i++) {
    curVal = data[i][key];
    if(curVal < curMin) {
      curMin = curVal;
    }
  }

  return curMin;

};

DataCollectionQuery.prototype.sum = function(key) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var val;

  if(!len) { return 0; }

  val = parseFloat(data[0][key]);

  for(var i = 1; i < len && !isNaN(val); i++) {
    val += parseFloat(data[i][key]);
  }

  return val;

};

DataCollectionQuery.prototype.avg = function(key) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var val;

  if(!len) { return 0; }

  val = parseFloat(data[0][key]);

  for(var i = 1; i < len && !isNaN(val); i++) {
    val += parseFloat(data[i][key]);
  }

  return val / len;

};

DataCollectionQuery.prototype.reduce = function(key, reduceFn) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var cur, val;

  if(!len) { return null; }

  val = data[0][key];

  for(var i = 1; i < len; i++) {
    cur = data[i][key];
    val = reduceFn.call(this, val, cur, i);
  }

  return val;

};

DataCollectionQuery.prototype.distinct = function(key) {

  this.__validate__();

  var data = this._data;
  var len = data.length;
  var values = Object.create(null);
  var value;

  if(len) {

    values[data[0][key] + '__' + (typeof data[0][key])] = true;

    for(var i = 1; i < len; i++) {
      value = data[i][key] + '__' + (typeof data[i][key]);
      if(!values[value]) {
        values[value] = true;
      }
    }

  }

  var distincts = Object.keys(values);
  var distinct, type;

  var convert = {
    'undefined': function(v) {
      return undefined;
    },
    'number': function(v) {
      return Number(v);
    },
    'string': function(v) {
      return v;
    },
    'boolean': function(v) {
      return {'true': true, 'false': false}[v];
    },
    'object': function(v) {
      if(v === 'null') {
        return null;
      } else {
        return Object.create(null);
      }
    },
    'function': function(v) {
      return function(){};
    }
  };

  for(i = 0, len = distincts.length; i < len; i++) {
    distinct = distincts[i].split('__');
    type = distinct.pop();
    distincts[i] = convert[type](distinct.join('__'));
  }

  return distincts.sort(function(a, b) {
    if(a === b) { return 0; }
    if(a === undefined) { return 1; }
    if(b === undefined) { return -1; }
    if(a === null) { return 1; }
    if(b === null) { return -1; }
    if(typeof a === 'function') {
      if(typeof b === 'function') { return 0; }
      return -1;
    }
    if(typeof a === 'object') {
      if(typeof b === 'function') { return 1; }
      if(typeof b === 'object') { return 0; }
      return -1;
    }
    if(typeof a === 'string') {
      if(typeof b === 'function') { return 1; }
      if(typeof b === 'object') { return 1; }
      if(typeof b === 'string') { return a > b ? 1 : -1; }
      return -1;
    }
    if(typeof a === 'boolean') {
      if(typeof b === 'boolean') { return a > b ? 1 : -1; }
      if(typeof b === 'number') { return -1; }
      return 1;
    }
    if(typeof b === 'number') {
      if(isNaN(a) && isNaN(b)) { return 0; }
      if(isNaN(a)) { return 1; }
      if(isNaN(b)) { return -1; }
      return a > b ? 1 : -1;
    }
    return 1;
  });

};

DataCollectionQuery.prototype.sequence = function(values) {

  this.__validate__();

  var dc = this.__parent;

  if(!dc.__index) {
    throw new Error('Can only use .sequence with an indexed DataCollection');
  }

  if(!(values instanceof Array)) {
    values = [].slice.call(arguments);
  }

  var tmp = [];
  var val;
  var indexedRows = dc.__indexedRows;

  for(var i = 0, len = values.length; i < len; i++) {

    val = values[i];

    indexedRows[val] && tmp.push(indexedRows[val]);

  }

  return new DataCollectionQuery(this.__parent, tmp);

};

DataCollectionQuery.prototype.limit = function(offset, count) {

  this.__validate__();

  if(typeof(count) === 'undefined') {
    count = offset;
    offset = 0;
  }

  return new DataCollectionQuery(this.__parent, this._data.slice(offset, offset + count));

};

DataCollectionQuery.prototype.count = function() {

  this.__validate__();

  return this._data.length;

};

DataCollectionQuery.prototype.first = function() {

  if(!this._data.length) {
    return null;
  }

  return this._data[0];

};

DataCollectionQuery.prototype.last = function() {

  if(!this._data.length) {
    return null;
  }

  return this._data[this._data.length - 1];

};

DataCollectionQuery.prototype.transform = function(keyMapPairs) {

  if(typeof keyMapPairs !== 'object' || keyMapPairs === null) {
    throw new Error('keyMapPairs must be valid object');
  }

  var keys = Object.keys(keyMapPairs);
  var key;

  var functionKeyMapPairs = {};
  var stringKeyMapPairs = {};

  var i, k;

  for(k = 0, klen = keys.length; k < klen; k++) {

    key = keys[k];

    if(typeof keyMapPairs[key] === 'string') {
      stringKeyMapPairs[key] = keyMapPairs[key];
      continue;
    }

    if(typeof keyMapPairs[key] === 'function') {
      functionKeyMapPairs[key] = keyMapPairs[key];
      continue;
    }

    throw new Error('keyMapPairs can only contain functions or strings');

  }

  var stringKeys = Object.keys(stringKeyMapPairs);
  var functionKeys = Object.keys(functionKeyMapPairs);

  var stringKeysLength = stringKeys.length;
  var functionKeysLength = functionKeys.length;

  var data = this._data;
  var len = data.length;
  var outputData = Array(len);

  var datum;
  var outputDatum;

  for(i = 0; i < len; i++) {

    datum = data[i];
    outputDatum = Object.create(null);

    for(k = 0, klen = stringKeysLength; k < klen; k++) {
      key = stringKeys[k];
      outputDatum[key] = datum[stringKeyMapPairs[key]];
    }

    for(k = 0, klen = functionKeysLength; k < klen; k++) {
      key = functionKeys[k];
      outputDatum[key] = functionKeyMapPairs[key].call(this, datum);
    }

    outputData[i] = outputDatum;

  }

  return new DataCollectionQuery(this.__parent, outputData);

};

DataCollectionQuery.prototype.json = function(key) {

  return JSON.stringify(this.values(key));

};
