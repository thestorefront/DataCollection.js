# DataCollection.js !['coverage'](http://img.shields.io/badge/coverage-95.5%25-brightgreen.svg)

Manipulate data from API responses with ease.

Inspired by modern Object Relational Managers, DataCollection.js is a
JavaScript library for storage, filtration, manipulation and accession of large
datasets. It is ideal for working with data returned from RESTful API
endpoints.

Boasting synchronous performance that nears native Array manipulation for large
(>10,000) recordsets, let DataCollection.js do your heavy lifting for you.


# Installation

You can begin using DataCollection.js by embedding the following script (assumes
  it has been placed in your root directory)

### Web

```html
<script src="/data_collection.js"></script>
```

Alternatively, the minified version can be found at

```html
<script src="/data_collection-min.js"></script>
```

You can then start using `DataCollection` objects with

```javascript
var dc = new DataCollection();
```

### node

```bash
$ npm install data-collection
```

Followed by a script with this require...

```javascript
var DataCollection = require('data-collection');
```

Woohoo!

# Examples

DataCollection can be used for fast, synchronous processing of large datasets
(arrays of objects) - i.e. a RESTful API response.

It is especially useful for maintaining maps of specific keys and indexing
results.

Let's say that I have a standardized Array containing the results of a RESTful
API response. My data set looks like this:

```javascript
var characters = [
  {
    id: 1,
    first_name: 'Jon',
    last_name: 'Snow',
    gender: 'm',
    age: 14,
    location: 'Winterfell'
  },
  {
    id: 2,
    first_name: 'Eddard',
    last_name: 'Stark',
    gender: 'm',
    age: 35,
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
```

First off, let's load this data into a `DataCollection`...

```javascript
var charDC = new DataCollection(characters);
```

Now, let's approach some problems...

---

### How do I find the Bastards from the North?

`filter` allows us to look for a specific value.

```javascript
var bastards = charDC.query().filter({last_name: 'Snow'}).values();
```

---

### How do I find out the highest age?

A simple `max()` call will do the trick.


```javascript
var topAge = charDC.query().max('age');
```

---

### How do I find all the unique locations?

DataCollection provides an easy `distinct` function for use.


###### DataCollection
```javascript
var locations = charDC.query().distinct('location');
```

---

### What if I want to permanently remove Catelyn and Eddard?

No problem!

###### DataCollection
```javascript
charDC.query().filter({first_name__in: ['Catelyn', 'Eddard']}).remove();
```

---

### More examples

```javascript
// Will return Jon, Eddard and Ramsay
charDC.query()
  .filter({gender: 'm', age__lt: 40})
  .values();

// Updates location
charDC.query()
  .filter({location: 'Winterfell'})
  .exclude({first_name: 'Jon'})
  .update({location: 'King\'s Landing'});

// Finds Roose, Ramsay
chardDC.query()
  .filter({first_name__contains: 'R'});

// Finds Roose, Ramsay, Eddard --- case insensitive
charDC.query()
  .filter({first_name__icontains: 'R'})
  .values();

// Creates a mapping for current future values...
charDC.createMapping('is_bastard', function(row) {
  return row.last_name === 'Snow';
});

// true
charDC.query().filter({first_name: 'Jon'}).first().is_bastard;
// false
charDC.query().filter({first_name: 'Catelyn'}).first().is_bastard;

// Add an entry (Can accept each entry as an argument, or an array)
charDC.insert({
  id: 6,
  first_name: 'Rob',
  last_name: 'Stark',
  gender: 'm',
  age: 14,
  location: 'Winterfell'
});

// new entry, but is also false
charDC.query().filer({first_name: 'Rob'}).first().is_bastard;

// will return Eddard and Catelyn rows
charDC.query()
  .sort('age', true) // sortDesc = true
  .limit(1, 2)
  .values();
```

And there's more! Try playing around.


# Documentation

## DataCollection Object

##### DataCollection
```
DataCollection( [Optional Array] data )
```

  Constructor (used with `new` keyword)

  If provided data, will run `DataCollection.prototype.load(data)`

---

### Methods

---

##### DataCollection.prototype.defineIndex
```
defineIndex( [String] key )
  returns self
```

  Define a *unique* key to use as an index for this collection
  used for `DataCollection.prototype.exists`, `DataCollection.prototype.fetch` and
  `DataCollection.prototype.destroy`

  All indexed values will be converted to strings, be careful about
  uniqueness

---

##### DataCollection.prototype.createMapping
```
createMapping( [String] key, [Function] map -> ([Object] row) )
  returns self
```

  Define a mapped key, and a function that returns the associated value
  based on the input row. Can be used any time, new mappings will be applied
  to your DataCollection immediately.

######  Example:

```javascript
var dc = new DataCollection();
dc.createMapping('c', function(row) { return row['a'] + row['b']; });
dc.load([{a: 1, b: 2}, {a: 2, b: 3}]);
console.log(dc.query().last()); // logs {a: 2, b: 3, c: 5}
```

---

##### DataCollection.prototype.exists
```
exists( [String] indexedValue )
  returns boolean
```

  Determine whether the DataCollection has an entry with the specified index
  based on your index key

---

##### DataCollection.prototype.fetch
```
fetch( [String] indexedValue )
  returns Object
```

  fetches object (if it exists) associated with the specified index based on
  your index key. Otherwise, returns `null`.

---

##### DataCollection.prototype.destroy
```
destroy( [String] indexedValue )
  returns true
```

  Destroys object (if it exists) associated with the specified index based
  on your index key. Otherwise, throws an error.

---

##### DataCollection.prototype.load
```
load( [Object] row_1, ..., [Object] row_n )
load( [Array] data )
  returns true
```

  Loads (truncates, then adds) new data from individual row Objects or an
  array of row Objects

---

##### DataCollection.prototype.insert
```
insert( [Object] row_1, ..., [Object] row_n )
insert( [Array] data )
  returns true
```

  Inserts new data from individual row Objects or an array of row Objects

---

##### DataCollection.prototype.truncate
```
truncate()
  returns true
```

  Empties all data from DataCollection

---

##### DataCollection.prototype.query
```
query()
  returns DataCollectionQuery
```

  returns a new DataCollectionQuery containing a referential set of all data
  from the parent DataCollection.

## DataCollectionQuery Object

##### DataCollectionQuery
```
DataCollectionQuery()
```

  Constructor, only accessible via `DataCollection.prototype.query()`

---

### Methods

---

##### DataCollectionQuery.prototype.filter
```
filter( [Object] filters )
  returns new DataCollectionQuery
```

  Returns a new `DataCollectionQuery` containing a referential subset of its
  parent. *Contains* filtered values (see: **Filters**)

---

##### DataCollectionQuery.prototype.exclude
```
exclude( [Object] filters )
  returns new DataCollectionQuery
```

  Returns a new `DataCollectionQuery` containing a referential subset of its
  parent. *Excludes* filtered values (see: **Filters**)

---

##### DataCollectionQuery.prototype.spawn
```
spawn( [Boolean] ignoreIndex )
  returns new DataCollection
```

  Creates a new `DataCollection` object (non-referential, new values) from
  all data contained within the current `DataCollectionQuery`. Will inherit the
  parent DataCollection's index unless `ignoreIndex` is set to true.

---

##### DataCollectionQuery.prototype.each
```
each( [Function] callback -> ([Object] row, [Integer] index) )
  returns self
```

  Loops through all rows of data, and performs `callback` for each one

###### Example

```javascript
var dc = new DataCollection([{a: 1, b: 2}, {a: 2, c: 3}]);
var query = dc.query();
dc.each(function(row, index) {
  console.log(index + ': ' + row['a'] + ', ' + row['b']);
});

// logs
//    0: 1, 2
//    1: 2, 3
```

---

##### DataCollectionQuery.prototype.update
```
update( [Object] values )
  returns self
```

  Assigns all key-value pairs from *values* to every row in the current
  selection (updates parent DataCollection)

---

##### DataCollectionQuery.prototype.remove
```
remove()
  returns true
```

  Removes all rows contained in `DataCollectionQuery` from the parent
  `DataCollection`

---

##### DataCollectionQuery.prototype.sort
```
sort( [String] key, [Optional Boolean] sortDesc = false )
  returns DataCollectionQuery
```

  Returns a new DataCollectionQuery containing the parent's rows, sorted
  by a specific key (descending if sortDesc = true).

  Sort order is as follows:
  null, NaN, Number, Infinity, Boolean, String, Object

---

##### DataCollectionQuery.prototype.values
```
values( [Optional String] key )
  returns Array
```

  Returns an array of all row Objects (each Object is referential!) in the
  `DataCollectionQuery`, or an array of all values from a specific key if
  provided

---

##### DataCollectionQuery.prototype.max
```
max( [String] key )
  returns Float
```

  Returns the maximum value (JavaScript "greater than (>)") contained in key
  from the `DataCollectionQuery` subset

---

##### DataCollectionQuery.prototype.min
```
min( [String] key )
  returns Float
```

  Returns the minimum value (JavaScript "greater than (>)") contained in key
  from the DataCollectionQuery subset

---

##### DataCollectionQuery.prototype.sum
```
sum( [String] key )
  returns Float
```

  Returns the numeric sum of all values contained in key from the
  `DataCollectionQuery` subset

---

##### DataCollectionQuery.prototype.avg
```
avg( [String] key )
  returns Float
```

  Returns the numeric average of all values contained in key from the
  `DataCollectionQuery` subset

---

##### DataCollectionQuery.prototype.reduce
```
reduce( [String] key, [Function] callback -> ([Any] prevValue, [Any] curValue, [Any] index) )
  returns Any
```

  Runs a specified reduction function on all values contained in key from
  the `DataCollectionQuery` subset.

---

##### DataCollectionQuery.prototype.distinct
```
distinct( [String] key )
  returns Array
```

  Returns an array of all unique values (converted to String) with specified
  key from the `DataCollectionQuery` subset

---

##### DataCollectionQuery.prototype.limit
```
limit( [Integer] count )
limit( [Integer] offset, [Integer] count )
  returns new DataCollectionQuery
```

  Returns a new `DataCollectionQuery` containing the first *count* items from
  the current `DataCollectionQuery`, or containing *count* items beginning at
  *offset*

---

##### DataCollectionQuery.prototype.count
```
count()
  returns Integer
```

  Returns the amount of items (rows) in the current DataCollectionQuery

## Filters

DataCollection supports a number of filters in the `filter()` and `exclude()`
functions. Many will be familiar if you've used the Django ORM or checked out
another project of ours, [FastAPI](http://github.com/thestorefront/FastAPI).

All filters are prefixed with a double underscore when used.

##### is
```javascript
a === b
```

Checks for exact equivalence. Equivalent to no specified filter. (Only the field
name). Exists for the purpose of standardization and edge cases (i.e. if your
field ends with `__`).

---

##### not
```javascript
a !== b
```

Checks for inequivalence. (Not exactly matching.)

---

##### gt
```javascript
a > b
```

Checks if contained value is greater than provided value.

---

##### gte
```javascript
a >= b
```

Checks if contained value is greater than or equal to provided value.

---

##### lt
```javascript
a < b
```

Checks if contained value is less than provided value.

---

##### lte
```javascript
a <= b
```

Checks if contained value is less than or equal to provided value.

---

##### contains
```javascript
a.indexOf(b) > -1
```

Checks if contained value contains the provided value. Works for strings
or arrays.

---

##### icontains
```javascript
a.toLowerCase().indexOf(b.toLowerCase()) > -1
```

Case insensitive contains. Only works for strings comparisons.

---

##### in
```javascript
b.indexOf(a) > -1
```

Checks if the contained value exists in the provided value. Works for strings or
arrays.

---

##### not_in
```javascript
b.indexOf(a) === -1
```

Checks if the contained value does not exist in the provided value. Works for
strings or arrays.


# Tests and Benchmarks

Current test coverage is **95.5%**

Included with this repository are tests (in `/tests`) to make sure everything
is running as expected.

There is a node webserver in the root repository directory that can be used
for testing on `localhost:8888`. To start the server (with node installed) simply run:

```
$ node testserv.js
```

Tests are run using [QUnit](http://qunitjs.com/), coverage sampled using [Blanket.js](http://blanketjs.org/).

A few benchmarks are logged in the JavaScript developer console.


# Acknowledgements

DataCollection is MIT licensed, feel free to use it wherever you'd like.
Thanks for checking us out! We welcome good, thoughtful contributions.

DataCollection was created at
[Storefront, Inc.](http://thestorefront.com/) in 2014 by [Keith Horwood](http://keithwhor.com).

Feel free to follow on Twitter:

[@thestorefront](http://twitter.com/thestorefront), [@keithwhor](http://twitter.com/keithwhor)


Or check out our GitHub Repositories for more libraries:

[Storefront on GitHub](http://github.com/thestorefront), [Keith Horwood on GitHub](http://github.com/keithwhor)
