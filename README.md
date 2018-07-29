jquery.formExport
====================

Adds the method `.formExport()` to [jQuery](http://jquery.com/) that serializes a form into a JavaScript Object, using the same format as the default Ruby on Rails request params.


And make sure it is included after jQuery, for example:
```html
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.formExport.js"></script>
```

Usage Example
-------------

HTML form:
```html
<form>
  <input type="text" name="title" value="Finding Loot"/>
  <input type="text" name="author[name]" value="John Smith"/>
  <input type="text" name="author[job]"  value="Legendary Pirate"/>
</form>
```

JavaScript:
```javascript
var result = $('form').formExport();

result(function(callback){
      // callback returns =>
{
  title: "Finding Loot",
  author: {
    name: "John Smith",
    job: "Legendary Pirate"
  }
}
  })


```

Form input, textarea and select tags are supported. Nested attributes and arrays can be specified by using the `attr[nested][nested]` syntax.

HTML form:
```html
<form id="my-profile">
  <!-- simple attribute -->
  <input type="text" name="fullName"              value="Mario Izquierdo" />

  <!-- nested attributes -->
  <input type="text" name="address[city]"         value="San Francisco" />
  <input type="text" name="address[state][name]"  value="California" />
  <input type="text" name="address[state][abbr]"  value="CA" />

  <!-- array -->
  <input type="text" name="jobbies[]"             value="code" />
  <input type="text" name="jobbies[]"             value="climbing" />

  <!-- nested arrays, textareas, checkboxes ... -->
  <textarea              name="projects[0][name]">formExport</textarea>
  <textarea              name="projects[0][language]">javascript</textarea>
  <input type="hidden"   name="projects[0][popular]" value="0" />
  <input type="checkbox" name="projects[0][popular]" value="1" checked />

  <textarea              name="projects[1][name]">tinytest.js</textarea>
  <textarea              name="projects[1][language]">javascript</textarea>
  <input type="hidden"   name="projects[1][popular]" value="0" />
  <input type="checkbox" name="projects[1][popular]" value="1"/>

  <!-- select -->
  <select name="selectOne">
    <option value="paper">Paper</option>
    <option value="rock" selected>Rock</option>
    <option value="scissors">Scissors</option>
  </select>

  <!-- select multiple options, just name it as an array[] -->
  <select multiple name="selectMultiple[]">
    <option value="red"  selected>Red</option>
    <option value="blue" selected>Blue</option>
    <option value="yellow">Yellow</option>
	</select>
</form>

```

JavaScript:

```javascript
var result = $('form').formExport();

result(function(callback){
      //callback returns =>
{
  fullName: "Mario Izquierdo",

  address: {
    city: "San Francisco",
    state: {
      name: "California",
      abbr: "CA"
    }
  },

  jobbies: ["code", "climbing"],

  projects: {
    '0': { name: "formExport", language: "javascript", popular: "1" },
    '1': { name: "tinytest.js",   language: "javascript", popular: "0" }
  },

  selectOne: "rock",
  selectMultiple: ["red", "blue"]
}
  })


```

The `formExport` function returns a JavaScript object, not a JSON String. The plugin should probably have been called `formExport` or similar, but those plugins already existed.




Parse values with :types
------------------------

All attribute values are **strings** by default. But you can force values to be parsed with specific types by appending the type with a colon.

```html
<form>
  <input type="text" name="strbydefault"     value=":string is the default (implicit) type"/>
  <input type="text" name="text:string"      value=":string type can still be used to overrid other parsing options"/>
  <input type="text" name="excluded:skip"    value="Use :skip to not include this field in the result"/>

  <input type="text" name="numbers[1]:number"           value="1"/>
  <input type="text" name="numbers[1.1]:number"         value="1.1"/>
  <input type="text" name="numbers[other stuff]:number" value="other stuff"/>

  <input type="text" name="bools[true]:boolean"      value="true"/>
  <input type="text" name="bools[false]:boolean"     value="false"/>
  <input type="text" name="bools[0]:boolean"         value="0"/>

  <input type="text" name="nulls[null]:null"            value="null"/>
  <input type="text" name="nulls[other stuff]:null"     value="other stuff"/>

  <input type="text" name="autos[string]:auto"          value="text with stuff"/>
  <input type="text" name="autos[0]:auto"               value="0"/>
  <input type="text" name="autos[1]:auto"               value="1"/>
  <input type="text" name="autos[true]:auto"            value="true"/>
  <input type="text" name="autos[false]:auto"           value="false"/>
  <input type="text" name="autos[null]:auto"            value="null"/>
  <input type="text" name="autos[list]:auto"            value="[1, 2, 3]"/>

  <input type="text" name="arrays[empty]:array"         value="[]"/>
  <input type="text" name="arrays[list]:array"          value="[1, 2, 3]"/>

  <input type="text" name="objects[empty]:object"       value="{}"/>
  <input type="text" name="objects[dict]:object"        value='{"my": "stuff"}'/>
</form>
```

```javascript
var result = $('form').formExport();

result(function(callback){
// callback returns =>
{
  "strbydefault": ":string is the default (implicit) type",
  "text": ":string type can still be used to overrid other parsing options",
  // excluded:skip is not included in the output
  "numbers": {
    "1": 1,
    "1.1": 1.1,
    "other stuff": NaN, // <-- Not a Number
  },
  "bools": {
    "true": true,
    "false": false,
    "0": false, // <-- "false", "null", "undefined", "", "0" parse as false
  },
  "nulls": {
    "null": null, // <-- "false", "null", "undefined", "", "0" parse as null
    "other stuff": "other stuff"
  },
  "autos": { // <-- works like the parseAll option
    "string": "text with stuff",
    "0": 0,         // <-- parsed as number
    "1": 1,         // <-- parsed as number
    "true": true,   // <-- parsed as boolean
    "false": false, // <-- parsed as boolean
    "null": null,   // <-- parsed as null
    "list": "[1, 2, 3]" // <-- array and object types are not auto-parsed
  },
  "arrays": { // <-- uses JSON.parse
    "empty": [],
    "not empty": [1,2,3]
  },
  "objects": { // <-- uses JSON.parse
    "empty": {},
    "not empty": {"my": "stuff"}
  }
}
  })


```
Options
-------

By default `.formExport()` with no options has this behavior:

  * Values are always **strings** (unless appending :types to the input names)
  * Unchecked checkboxes are ignored (as defined in the W3C rules for [successful controls](http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2)).
  * Disabled elements are ignored (W3C rules)
  * Keys (input names) are always **strings** (nested params are objects by default)

This is because `formExport` is designed to return exactly the same as a regular HTML form submission when serialized as Rack/Rails params, which ensures maximun compatibility and stability.

Allowed options to change the default behavior:

  * **checkboxUncheckedValue: string**, string value used on unchecked checkboxes (otherwise those values are ignored). For example `{checkboxUncheckedValue: ""}`. If the value needs to be parsed (i.e. to a Boolean or Null) use a parse option (i.e. `parseBooleans: true`) or define the input with the `:boolean` or `:null` types.
  * **parseBooleans: true**, automatically detect and convert strings `"true"` and `"false"` to booleans `true` and `false`.
  * **parseNumbers: true**, automatically detect and convert strings like `"1"`, `"33.33"`, `"-44"` to numbers like `1`, `33.33`, `-44`.
  * **parseNulls: true**, automatically detect and convert the string `"null"` to the null value `null`.
  * **parseAll: true**, all of the above. This is the same as if the default :type was `:auto` instead of `:string`.
  * **parseWithFunction: function**, define your own parse `function(inputValue, inputName) { return parsedValue }`.
  * **skipFalsyValuesForFields: []**, skip given fields (by name) with falsy values. You can use `data-skip-falsy="true"` input attribute as well. Falsy values are determined after converting to a given type, note that `"0"` as :string is truthy, but `0` as :number is falsy.
  * **skipFalsyValuesForTypes: []**, skip given fields (by :type) with falsy values (i.e. `skipFalsyValuesForTypes: ["string", "number"]` would skip `""` for `:string` fields, and `0` for `:number` fields).
  * **customTypes: {}**, define your own :types or override the default types. Defined as an object like `{ type: function(value){...} }`. For example: `{customTypes: {nullable: function(str){ return str || null; }}`.
  * **defaultTypes: {defaultTypes}**, in case you want to re-define all the :types. Defined as an object like `{ type: function(value){...} }`
  * **useIntKeysAsArrayIndex: true**, when using integers as keys (i.e. `<input name="foods[0]" value="banana">`), serialize as an array (`{"foods": ["banana"]}`) instead of an object (`{"foods": {"0": "banana"}`).
  * **isAjex: false**,  it can be changed according to need but ajexUrl must be provided .

 Ajex Example
-------------

HTML form:
```html
<form>
  <input type="text" name="title" value="Finding Loot"/>
  <input type="text" name="author[name]" value="John Smith"/>
  <input type="text" name="author[job]"  value="Legendary Pirate"/>
</form>
```

JavaScript:
```javascript
var result = $('form').formExport({isAjex:true,ajexUrl:'http://localhost/projects/temp/test.php',exportType:'json'});

result(function(callback){
      // callback returns =>
{
    ajex responce
}
  })


```

More info about options usage in the sections below.

## Include unchecked checkboxes ##

In my opinion, the most confusing detail when serializing a form is the input type checkbox, that will include the value if checked, and nothing if unchecked.

To deal with this, it is a common practice to use hidden fields for the "unchecked" values:

```html
<!-- Only one booleanAttr will be serialized, being "true" or "false" depending if the checkbox is selected or not -->
<input type="hidden"   name="booleanAttr" value="false" />
<input type="checkbox" name="booleanAttr" value="true" />
```

This solution is somehow verbose, but it is unobtrusive and ensures progressive enhancement, because it is the standard HTML behavior (also works without JavaScript).

But, to make things easier, `formExport` includes the option `checkboxUncheckedValue` and the possibility to add the attribute `data-unchecked-value` to the checkboxes.





Author Aditya Srivastav
