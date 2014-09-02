!function(window) {

  function DataCollection(data) {

    this.__index = null;
    this.__indexedRows = Object.create(null);

    this.__map = Object.create(null);

    this.__instance = null;
    this.__increment__();

    this._data = [];

    if(data instanceof Array) {
      this.load(data);
    }

  };

  DataCollection.prototype.__instances = 0;

  DataCollection.prototype.__increment__ = function() {

    if(!this.__parent) {
      this.__instance = this.constructor.prototype.__instances++;
    }

  };

  DataCollection.prototype.__find__ = function(row) {

    var data = this._data;
    var len = data.length;

    if(data[(len >> 1) + 1] === row) {
      return (len >> 1) + 1;
    }

    for(var i = 0; i < (len >> 1); i++) {
      if(data[i] === row) { return i; }
      if(data[len - i - 1] === row) { return len - i - 1; }
    }

    return -1;

  };

  DataCollection.prototype.__prepare__ = function(data) {

    var newData = Array(data.length);
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
        var row = data[i];
        if(!row || typeof row !== 'object') { continue; }
        var newRow = Object.create(null);

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

        newData[i] = newRow;

      }

    } else {

      for(var i = 0, len = data.length; i < len; i++) {
        var row = data[i];
        if(!row || typeof row !== 'object') { continue; }
        var newRow = Object.create(null);

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
        newData[i] = newRow;

      }

    }

    return newData;

  };

  DataCollection.prototype.defineIndex = function(key) {

    if(this.__parent) {
      throw new Error('Can only define indices on parent DataCollection');
    }

    this.__index = key;

    var index = key;
    var indexedRows = Object.create(null);
    var data = this._data;

    for(var i = 0, len = data.length; i < len; i++) {
      indexedRows[data[i][index]] = data[i];
    }

    this.__indexedRows = indexedRows;

    return this;

  };

  DataCollection.prototype.createMapping = function(key, fnMap) {

    if(this.__parent) {
      throw new Error('Can only define maps on parent DataCollection');
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

    this._data = this.__prepare__(data);
    this.__increment__();

    return true;

  };

  DataCollection.prototype.truncate = function(data) {

    this.__indexedRows = Object.create(null);
    this._data = [];

    return true;

  };

  DataCollection.prototype.query = function() {

    return new DataCollectionQuery(this, this._data.slice());

  };



  /* DataCollectionQuery */



  function DataCollectionQuery(parent, data) {

    if(!(parent instanceof DataCollection) && parent !== null) {
      throw new Error('DataCollectionQuery requires valid DataCollection parent');
    }

    if(!(data instanceof Array)) {
      throw new Error('DataCollectionQuery requires valid Array of data');
    }

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

  DataCollectionQuery.prototype.__filter = function(filters, exclude) {

    this.__validate__();

    exclude = !!exclude;

    var data = this._data.slice();
    var keys = Object.keys(filters);
    var key;

    var filterData = [];
    var filter;
    var filterType;

    for(var i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      filter = key.split('__');
      if(filter.length < 2) {
        filter.push('is');
      }
      filterType = filter.pop();
      filter = filter.join('__');

      if(!this.__compare[filterType]) {
        throw new Error('Filter type "' + filterType + '" not supported.');
      }
      filterData.push([this.__compare[filterType], filter, filters[key]]);
    }

    var tmpFilter;
    var i, compareFn, key, val;

    var filterLength = filterData.length;
    var filterMax = filterLength - 1; // Caching purposes
    var len = data.length;

    for(var j = 0; j !== filterLength; j++) {
      tmpFilter = filterData[j];
      compareFn = tmpFilter[0];
      key = tmpFilter[1];
      val = tmpFilter[2];
      i = len;
      while(i--) { data[i] && (compareFn(data[i][key], val) === exclude) && (data[i] = null); }
    }

    var tmp = [];
    var count = 0;
    for(var i = 0; i !== len; i++) { data[i] && (tmp[count++] = data[i]); }

    return new DataCollectionQuery(this.__parent, tmp);

  };

  DataCollectionQuery.prototype.filter = function(filters) {
    return this.__filter(filters, false);
  };

  DataCollectionQuery.prototype.exclude = function(filters) {
    return this.__filter(filters, true);
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

  DataCollectionQuery.prototype.sort = function(key, sortDesc) {

    this.__validate__();

    key = (key + '').replace(/[^A-Za-z0-9]/gi, '_');

    sortDesc = !!sortDesc;

    var sortFn = new Function(
      'a',
      'b',
      [
        'var val = ' + (sortDesc ? -1 : 1) + ';',
        'if(a[\'' + key + '\'] === b[\'' + key + '\']) { return 0; }',
        'if(a[\'' + key + '\'] === null) { return -(val); }',
        'if(b[\'' + key + '\'] === null) { return (val); }',
        'if(typeof a[\'' + key + '\'] === \'number\') {',
        '  if(typeof b[\'' + key + '\'] === \'number\') {',
        '    if(isNaN(a[\'' + key + '\']) && isNaN(b[\'' + key + '\'])) { return 0; }',
        '    if(isNaN(b[\'' + key + '\'])) { return (val); }',
        '    return a[\'' + key + '\'] > b[\'' + key + '\'] ? (val) : -(val);',
        '  }',
        '  if(typeof b[\'' + key + '\'] === \'boolean\') { return -(val); }',
        '  if(typeof b[\'' + key + '\'] === \'string\') { return -(val); }',
        '  if(typeof b[\'' + key + '\'] === \'object\') { return -(val); }',
        '}',
        'if(typeof a[\'' + key + '\'] === \'boolean\') {',
        '  if(typeof b[\'' + key + '\'] === \'number\') { return (val); }',
        '  if(typeof b[\'' + key + '\'] === \'boolean\') { return a[\'' + key + '\'] > b[\'' + key + '\'] ? (val) : -(val); }',
        '  if(typeof b[\'' + key + '\'] === \'string\') { return -(val); }',
        '  if(typeof b[\'' + key + '\'] === \'object\') { return -(val); }',
        '}',
        'if(typeof a[\'' + key + '\'] === \'string\') {',
        '  if(typeof b[\'' + key + '\'] === \'number\') { return (val); }',
        '  if(typeof b[\'' + key + '\'] === \'boolean\') { return (val); }',
        '  if(typeof b[\'' + key + '\'] === \'string\') { return a[\'' + key + '\'] > b[\'' + key + '\'] ? (val) : -(val); }',
        '  if(typeof b[\'' + key + '\'] === \'object\') { return -(val); }',
        '}',
        'if(typeof a[\'' + key + '\'] === \'object\') {',
        '  if(typeof b[\'' + key + '\'] === \'object\') { return 0; }',
        '  return (val);',
        '}',
        'return 0;'
      ].join('\n')
    );

    var tmp = this._data.slice().sort(sortFn);

    return new DataCollectionQuery(this.__parent, tmp);

  };

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

      values[data[0][key]] = true;

      for(var i = 1; i < len; i++) {
        value = data[i][key];
        if(!values[value]) {
          values[value] = true;
        }
      }

    }

    return Object.keys(values);

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

  window['DataCollection'] = DataCollection;

}(window);
