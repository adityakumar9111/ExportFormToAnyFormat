
(function (factory) {
  if (typeof define === 'function' && define.amd) { 
    define(['jquery'], factory);
  } else if (typeof exports === 'object') { 
    var jQuery = require('jquery');
    module.exports = factory(jQuery);
  } else { 
    factory(window.jQuery || window.Zepto || window.$); 
  }

}(function ($) {
  "use strict";

  $.fn.formExport = function (options,callback123) {
    var f, $form, opts, formAsArray, serializedObject, name, value, parsedValue, _obj, nameWithNoType, type, keys, skipFalsy;
    f = $.formExport;
    $form = this; 
    opts = f.setupOpts(options); 
    formAsArray = $form.serializeArray();
    f.readCheckboxUncheckedValues(formAsArray, opts, $form); 
    serializedObject = {};
    $.each(formAsArray, function (i, obj) {
      name  = obj.name; 
      value = obj.value; 
      _obj = f.extractTypeAndNameWithNoType(name);
      nameWithNoType = _obj.nameWithNoType; 
      type = _obj.type; 
      if (!type) type = f.attrFromInputWithName($form, name, 'data-value-type');
      f.validateType(name, type, opts); 

      if (type !== 'skip') { 
        keys = f.splitInputNameIntoKeysArray(nameWithNoType);
        parsedValue = f.parseValue(value, name, type, opts); 

        skipFalsy = !parsedValue && f.shouldSkipFalsy($form, name, nameWithNoType, type, opts); 
        if (!skipFalsy) {
          f.deepSet(serializedObject, keys, parsedValue, opts);
        }
      }
    });

  

     if(opts.exportType == 'json' && opts.isAjex == true){

          if(opts.ajexUrl == ''){
        throw new Error('url must me specified');
      } 

      else{
             $.ajax({
             type: "POST",
             url:opts.ajexUrl,
            data:  JSON.stringify(serializedObject),
            success: function(resultResponse){
            callback123(resultResponse); 
         }
          });
        
      } 

    }

     else if(opts.exportType != 'json' && opts.isAjex == true){

      if(opts.ajexUrl == ''){
        throw new Error('url must me specified');
      } 

      else{
             $.ajax({
             type: "POST",
             url:opts.ajexUrl,
            data: serializedObject,
            success: function(resultResponse){
            callback123(resultResponse); 
         }
          });
      } 
        
    }

      else if(opts.exportType == 'json' && opts.isAjex == false){

            callback123( JSON.stringify(serializedObject));
    }

    else{
            callback123(serializedObject);
         
    }
   
  };
  $.formExport = {

    defaultOptions: {
      checkboxUncheckedValue: undefined, 
      exportType:"object",
      isAjex:false,
      ajexUrl:'',
      parseNumbers: false, 
      parseBooleans: false, 
      parseNulls: false, 
      parseAll: false, 
      parseWithFunction: null, 

      skipFalsyValuesForTypes: [], 
      skipFalsyValuesForFields: [], 

      customTypes: {}, 
      defaultTypes: {
        "string":  function(str) { return String(str); },
        "number":  function(str) { return Number(str); },
        "boolean": function(str) { var falses = ["false", "null", "undefined", "", "0"]; return falses.indexOf(str) === -1; },
        "null":    function(str) { var falses = ["false", "null", "undefined", "", "0"]; return falses.indexOf(str) === -1 ? str : null; },
        "array":   function(str) { return JSON.parse(str); },
        "object":  function(str) { return JSON.parse(str); },
        "auto":    function(str) { return $.formExport.parseValue(str, null, null, {parseNumbers: true, parseBooleans: true, parseNulls: true}); }, // try again with something like "parseAll"
        "skip":    null 
      },

      useIntKeysAsArrayIndex: false 
    },

    setupOpts: function(options) {
      var opt, validOpts, defaultOptions, optWithDefault, parseAll, f, exportType;
      f = $.formExport;

      if (options == null) { options = {}; }   
      defaultOptions = f.defaultOptions || {}; 

      // Make sure that the user didn't misspell an option
      validOpts = ['checkboxUncheckedValue', 'parseNumbers', 'parseBooleans', 'parseNulls', 'parseAll', 'parseWithFunction', 'skipFalsyValuesForTypes', 'skipFalsyValuesForFields', 'customTypes', 'defaultTypes', 'useIntKeysAsArrayIndex','exportType','isAjex','ajexUrl']; // re-define because the user may override the defaultOptions
      for (opt in options) {
        if (validOpts.indexOf(opt) === -1) {
          throw new  Error("formExport ERROR: invalid option '" + opt + "'. Please use one of " + validOpts.join(', '));
        }
      }

      optWithDefault = function(key) { return (options[key] !== false) && (options[key] !== '') && (options[key] || defaultOptions[key]); };

      parseAll = optWithDefault('parseAll');
      return {
        checkboxUncheckedValue:    optWithDefault('checkboxUncheckedValue'),

        parseNumbers:  parseAll || optWithDefault('parseNumbers'),
        parseBooleans: parseAll || optWithDefault('parseBooleans'),
        parseNulls:    parseAll || optWithDefault('parseNulls'),
        parseWithFunction:         optWithDefault('parseWithFunction'),

        skipFalsyValuesForTypes:   optWithDefault('skipFalsyValuesForTypes'),
        skipFalsyValuesForFields:  optWithDefault('skipFalsyValuesForFields'),
        typeFunctions: $.extend({}, optWithDefault('defaultTypes'), optWithDefault('customTypes')),

        useIntKeysAsArrayIndex: optWithDefault('useIntKeysAsArrayIndex'),
        exportType: optWithDefault('exportType'),
        isAjex: optWithDefault('isAjex'),
        ajexUrl: optWithDefault('ajexUrl')
      };
    },

    
    parseValue: function(valStr, inputName, type, opts) {
      var f, parsedVal;
      f = $.formExport;
      parsedVal = valStr; 

      if (opts.typeFunctions && type && opts.typeFunctions[type]) { 
        parsedVal = opts.typeFunctions[type](valStr);
      } else if (opts.parseNumbers  && f.isNumeric(valStr)) { 
        parsedVal = Number(valStr);
      } else if (opts.parseBooleans && (valStr === "true" || valStr === "false")) { 
        parsedVal = (valStr === "true");
      } else if (opts.parseNulls    && valStr == "null") { // auto: null
        parsedVal = null;
      } else if (opts.typeFunctions && opts.typeFunctions["string"]) { 
        parsedVal = opts.typeFunctions["string"](valStr);
      }
      
      if (opts.parseWithFunction && !type) {
        parsedVal = opts.parseWithFunction(parsedVal, inputName);
      }

      return parsedVal;
    },

    isObject:          function(obj) { return obj === Object(obj); }, // is it an Object?
    isUndefined:       function(obj) { return obj === void 0; }, // safe check for undefined values
    isValidArrayIndex: function(val) { return /^[0-9]+$/.test(String(val)); }, // 1,2,3,4 ... are valid array indexes
    isNumeric:         function(obj) { return obj - parseFloat(obj) >= 0; }, // taken from jQuery.isNumeric implementation. Not using jQuery.isNumeric to support old jQuery and Zepto versions

    optionKeys: function(obj) { if (Object.keys) { return Object.keys(obj); } else { var key, keys = []; for(key in obj){ keys.push(key); } return keys;} }, // polyfill Object.keys to get option keys in IE<9

    readCheckboxUncheckedValues: function (formAsArray, opts, $form) {
      var selector, $uncheckedCheckboxes, $el, uncheckedValue, f, name;
      if (opts == null) { opts = {}; }
      f = $.formExport;

      selector = 'input[type=checkbox][name]:not(:checked):not([disabled])';
      $uncheckedCheckboxes = $form.find(selector).add($form.filter(selector));
      $uncheckedCheckboxes.each(function (i, el) {
        // Check data attr first, then the option
        $el = $(el);
        uncheckedValue = $el.attr('data-unchecked-value');
        if (uncheckedValue == null) {
          uncheckedValue = opts.checkboxUncheckedValue;
        }

        if (uncheckedValue != null) {
          if (el.name && el.name.indexOf("[][") !== -1) { 
            throw new Error("formExport ERROR: checkbox unchecked values are not supported on nested arrays of objects like '"+el.name+"'. See https://github.com/marioizquierdo/jquery.formExport/issues/67");
          }
          formAsArray.push({name: el.name, value: uncheckedValue});
        }
      });
    },

    extractTypeAndNameWithNoType: function(name) {
      var match;
      if (match = name.match(/(.*):([^:]+)$/)) {
        return {nameWithNoType: match[1], type: match[2]};
      } else {
        return {nameWithNoType: name, type: null};
      }
    },

    shouldSkipFalsy: function($form, name, nameWithNoType, type, opts) {
      var f = $.formExport;
      
      var skipFromDataAttr = f.attrFromInputWithName($form, name, 'data-skip-falsy');
      if (skipFromDataAttr != null) {
        return skipFromDataAttr !== 'false'; 
      }

      var optForFields = opts.skipFalsyValuesForFields;
      if (optForFields && (optForFields.indexOf(nameWithNoType) !== -1 || optForFields.indexOf(name) !== -1)) {
        return true;
      }
      
      var optForTypes = opts.skipFalsyValuesForTypes;
      if (type == null) type = 'string'; 
      if (optForTypes && optForTypes.indexOf(type) !== -1) {
        return true
      }

      return false;
    },

    attrFromInputWithName: function($form, name, attrName) {
      var escapedName, selector, $input, attrValue;
      escapedName = name.replace(/(:|\.|\[|\]|\s)/g,'\\$1'); 
      selector = '[name="' + escapedName + '"]';
      $input = $form.find(selector).add($form.filter(selector)); 
      return $input.attr(attrName);
    },
    validateType: function(name, type, opts) {
      var validTypes, f;
      f = $.formExport;
      validTypes = f.optionKeys(opts ? opts.typeFunctions : f.defaultOptions.defaultTypes);
      if (!type || validTypes.indexOf(type) !== -1) {
        return true;
      } else {
        throw new Error("formExport ERROR: Invalid type " + type + " found in input name '" + name + "', please use one of " + validTypes.join(', '));
      }
    },

    splitInputNameIntoKeysArray: function(nameWithNoType) {
      var keys, f;
      f = $.formExport;
      keys = nameWithNoType.split('['); 
      keys = $.map(keys, function (key) { return key.replace(/\]/g, ''); }); 
      if (keys[0] === '') { keys.shift(); } 
      return keys;
    },
    deepSet: function (o, keys, value, opts) {
      var key, nextKey, tail, lastIdx, lastVal, f;
      if (opts == null) { opts = {}; }
      f = $.formExport;
      if (f.isUndefined(o)) { throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined"); }
      if (!keys || keys.length === 0) { throw new Error("ArgumentError: param 'keys' expected to be an array with least one element"); }

      key = keys[0];
      if (keys.length === 1) {
        if (key === '') {
          o.push(value); 
        } else {
          o[key] = value; 
        }
      } else {
        nextKey = keys[1];

        if (key === '') {
          lastIdx = o.length - 1; 
          lastVal = o[lastIdx];
          if (f.isObject(lastVal) && (f.isUndefined(lastVal[nextKey]) || keys.length > 2)) { 
            key = lastIdx; 
          } else {
            key = lastIdx + 1; 
          }
        }
        if (nextKey === '') {
          if (f.isUndefined(o[key]) || !$.isArray(o[key])) {
            o[key] = []; 
          }
        } else {
          if (opts.useIntKeysAsArrayIndex && f.isValidArrayIndex(nextKey)) { 
            if (f.isUndefined(o[key]) || !$.isArray(o[key])) {
              o[key] = []; 
            }
          } else { 
            if (f.isUndefined(o[key]) || !f.isObject(o[key])) {
              o[key] = {}; 
            }
          }
        }

        
        tail = keys.slice(1);
        f.deepSet(o[key], tail, value, opts);
      }
    }

  };

}));