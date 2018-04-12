/**
* LAB JAVASCRIPT EXTENSION
* @author rcj1492
* @license ©2016-2018 Collective Acuity
* @email support@collectiveacuity.com
*
* requirements:
* jquery
**/

//// import dependencies (when es6 is standard)
//import $ from 'jquery'

function logConsole(obj) {

/* a method to report any data object to log during development */
    
    verbose = false
    if ('system_environment' in window){
        if (window.system_environment == 'dev' || window.system_environment == 'tunnel'){
            verbose = true
        }
    }
    if (obj == null || typeof(obj) == 'string' || typeof(obj) == 'number' || typeof(obj) == 'boolean') {
        if (verbose){
            console.log(obj)
        }
    } else if ($.isArray(obj) || typeof(obj) == 'object'){
        if (verbose){
            console.log(JSON.stringify(obj))
        }
    } else if (verbose) {
        try {
            console.log(JSON.stringify(obj))
        } catch(err) {}
    }

}

function deepCopy(obj) {

/* a method for cloning an object */

// https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object

    if (obj == null || typeof(obj) != "object") {
        return obj
    } else {
        var deep_copy = obj.constructor()
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) deep_copy[attr] = obj[attr]
        }
        return deep_copy
    }

}

function ingestString(string_value) {

/* a method to ensure output is a string value */

    var default_value = ''
    if (typeof(string_value) != 'string') {
        return default_value
    } else if (string_value === 'undefined') {
        return default_value
    }
    return string_value

}

function ingestMap(map_object) {

/* a method to ensure output is a map object */

    var empty_map = {}
    if (map_object == null || typeof(map_object) == 'undefined') {
        return empty_map
    } else if (typeof(map_object) != 'object') {
        return empty_map
    } else if ($.isArray(map_object)){
        return empty_map
    } else if (!(mapSize(map_object))) {
        return empty_map
    }
    
    return map_object
    
}

function ingestBoolean(boolean_value) {

/* a method to ensure output is a boolean value */
    
    var default_value = false
    if (boolean_value == null || typeof(boolean_value) == 'undefined') {
        return default_value
    } else if (typeof(boolean_value) != 'boolean') {
        return default_value
    }
    return boolean_value

}

function ingestInteger(integer_value) {

/* a method to ensure output is an integer value */
     
    var default_value = 0
    if (integer_value == null || typeof(integer_value) == 'undefined') {
        return default_value
    } else if (typeof(integer_value) != 'number' || !(Math.floor(integer_value) === integer_value)) {
        return default_value
    }
    return integer_value
    
}

function ingestNumber(numeric_value) {

/* a method to ensure that output is a numerical value */
    
// NOTE FLOATS CANNOT BE PARSED CORRECTLY DUE TO HOW JS TREATS NO REMAINDERS (AKA 1.0)
    
    var default_value = 0.0
    if (numeric_value == null || typeof(numeric_value) == 'undefined') {
        return default_value
    } else if (typeof(numeric_value) != 'number') {
        return default_value
    }
    return numeric_value

}

function ingestArray(array_object) {

/* a method to ensure output is an array */

    var empty_array = []
    if (array_object == null || typeof(array_object) == 'undefined') {
        return empty_array
    } else if (!($.isArray(array_object))) {
        return empty_array
    }
    return array_object

}

function isMap(obj) {
 
/* a method to determine if an object is a map */

    if (obj == null || typeof(obj) == 'undefined') {
        return false
    } else if (typeof(obj) != 'object') {
        return false
    } else if ($.isArray(obj)){
        return false
    }
    
    return true
    
}

function isFunction(obj) {

/* a method to determine if an object is a function */

    if (obj == null || typeof(obj) == 'undefined') {
        return false
    } else if ({}.toString.call(obj) != '[object Function]') {
        return false
    }
    
    return true

}

function mapSize(map_object) {
    
/* a method to calculate the number of keys in a map object */
    
    var count = 0
    $.each(map_object, function(i, elem) {
        count ++
    })
    
    return count

}

function deleteObject(obj) {

    /* a method for deleting all the properties of an object */
    
    for (var key in obj){
        if (obj.hasOwnProperty(key)){
            obj[key] = null
            delete obj[key]
        }
    }
    obj = null
    
}

function sortArray(array_object, sort_criteria) {

    /* a method to sort an array of maps by criteria */
    
    /** sort criteria should be a list of single key-value pair maps
    *   where the key matches a key in each map in the array object
    *
    *   if the value of a key in the sort criteria is empty, then
    *   the array will be sorted in ascending alphanumerical value
    *   otherwise, it will be reverse alphanumerical order
    *
    *   EG. [ { "dt": "" }, { "last_name": "descending" } ]
    * 
    **/
    
    var array = ingestArray(array_object)
    var criteria = ingestArray(sort_criteria)
    
    if (array.length){
        for (var i = 0; i < criteria.length; i++){
            var sample_record = ingestMap(array[0])
            for (var key in ingestMap(criteria[i])){
                 if (key in sample_record){
            
            // sort descending
                    if (ingestString(criteria[i][key])){
                        array.sort(function(a, b){
                            if (b[key] > a[key]){ return 1 }
                            else if (b[key] < a[key]){ return -1 }
                            else { return 0 }
                        })
            
            // sort ascending
                    } else {
                        array.sort(function(a, b){
                            if (a[key] > b[key]){ return 1 }
                            else if (a[key] < b[key]){ return -1 }
                            else { return 0 }
                        })
                    }
                    
                } else {
                    throw 'sort_criteria[' + i.toString() + '].' + key + ' is not a field in the objects of the array.'
                }
            }
        }
    }

    return array

}

function filterArray(array_object, filter_criteria, max_results=0){

    /* a method to filter an array of maps based upon criteria */
    
// ingest variables
    var filtered_array = []
    var record_array = ingestArray(array_object)
    filter_criteria = ingestMap(filter_criteria)

// iterate over records testing filter criteria    
    for (var i = 0; i < record_array.length; i++){
    
        var add_record = true
        var record = ingestMap(record_array[i])
        
        for (var key in filter_criteria){
        
    // catch non-existent keys
            if (!(key in record)){
                if ('value_exists' in filter_criteria[key]){
                    if (!filter_criteria[key]['value_exists']){
                        continue
                    }
                }
                add_record = false
                break
            }    
        
            for (var k in filter_criteria[key]){
    
    // filter based upon key existence
                if (k == 'value_exists'){
                    if (!filter_criteria[key][k]){
                        if (key in record){
                            add_record = false
                            break
                        }
                    }
                }
    
    // filter based upon equal to value
                if (k == 'equal_to'){
                    if (filter_criteria[key][k] != record_array[i][key]){
                        add_record = false
                        break
                    }
                }
    
    // TODO add more filter tests
    
            }
            if (!add_record){
                break
            }
            
        }
        


// add valid records and check for max
        if (add_record){
            filtered_array.push(record_array[i])
            if (ingestInteger(max_results)){
                if (filtered_array.length >= max_results){
                    break
                }
            }
        }
        
    }
    
    return filtered_array
    
}

function capitalizeString(string_value, pythonic=false) {

    /* a method to capitalize all the words in a string */

// clean up and split words
    var clean_string = ingestString(string_value)
    if (pythonic){
        clean_string = clean_string.replace(/_/g, ' ')
    }

// construct capitalized string
    var capitalized_string = clean_string.replace(/\b\w/g, function(x){ return x.toUpperCase() })
    
//// capitalize each word
//    var string_array = ingestString(clean_string).split(' ')
//    var capitalized_array = []
//    for (var i = 0; i < string_array.length; i++){
//        var capitalized_word = string_array[i].toUpperCase().slice(0,1) + string_array[i].slice(1)
//        capitalized_array.push(capitalized_word)
//    }
//
//// recombine words
//    var capitalized_string = ''
//    if (capitalized_array.length){
//        capitalized_string = capitalized_array.join(' ')
//    }
    
    return capitalized_string
    
}

function injectLinks(string_value, dns_prefetch=true) {

/* a method to substitute an <a> element for a url value in a text string */

// define substitution function
    function _replace_url(x){
        var _url_string = '<a href="' + x + '" target="_blank">' + x + '</a>'
        if (dns_prefetch){
            var _prefetch_html = '<link rel="dns-prefetch" href="' + x + '">'
            $('head').append(_prefetch_html)
        }
        return _url_string
    }
    
    var new_string = string_value.replace(/https?:\/\/.*?(\s|,|$)/g, _replace_url)

    return new_string
    
}

function unpackKwargs(kwargs_input, kwargs_model, method_name) {

/* a method for unpacking and validating keyword arguments */

// TODO corporaate recursion
    
    if (typeof(kwargs_input) === 'undefined'){
        kwargs_input = {}
    }

    for (var key in kwargs_model) {
        var console_message = 'error unpacking ' + method_name + ': '
        try {
            if (key in kwargs_input) {
                if (typeof(kwargs_input[key]) === typeof(kwargs_model[key])) {
                    kwargs_model[key] = kwargs_input[key]
                } else {
                    console_message += key + ' must be a ' + typeof(kwargs_model[key]) + '.'
                    logConsole(console_message)
                };
            };
        } catch(e) {
            console_message += key + ' failed to unpack.'
            logConsole(console_message);
        };

    };

}

function convertElement(element_selector, new_tag) {

/* a method to convert one type of element to another in the DOM */
    
// construct method variables
    var old_tag = $(element_selector)[0].tagName.toLowerCase()
    var new_element_tag = '<' + new_tag + '></' + new_tag + '>'

// construct a new element
    var new_element = $(new_element_tag)

// add each attribute to new element
    $(element_selector).each(function() {
        $.each(this.attributes, function() {
            if(this.specified) {
                new_element.attr(this.name, this.value)
            }
        })
    })

// add inner html contents to new element
    new_element.html($(element_selector)[0].innerHTML)

// add/remove href attributes to/from new element
    if (new_tag == 'a'){
        new_element.attr('href', '#')
    } else if (old_tag == 'a'){
        new_element.removeAttr('href')
    }

// update DOM with replaced element
    $(element_selector).replaceWith(new_element)

}

function toggleStyle(element_selector, style_property) {

/* a method for changing a specific style in a DOM element */

// construct style regex pattern from style property
    var _style_regex = new RegExp(style_property, 'i')
    var jquery_element = $(element_selector)
    
// style already exists, add the style
    if (typeof(jquery_element.attr("style")) === "undefined") {
        jquery_element.attr("style", style_property)
    } else if (!_style_regex.test(jquery_element.attr("style"))) {
        var _new_style = jquery_element.attr("style") + " " + style_property
        jquery_element.attr("style", _new_style);
// otherwise, remove the style
    } else {
        var _new_style = jquery_element.attr("style").replace(style_property, "")
        if (_new_style) {
            jquery_element.attr("style", _new_style)
        } else {
            jquery_element.removeAttr("style")
        };
    };

}

function retrieveParams() {

/* a method to parse the params in the url */

    var param_fields = {}

// parse params from query string
    var query_fields = window.location.search.substring(1)
    var params = query_fields.split("&")
    for (var i = 0; i < params.length; i++){
        var pair = params[i].split('=')
        param_fields[pair[0]] = decodeURIComponent(pair[1])
    }

// reset page
    if (param_fields){
        if (window.history.pushState){
            var page_url = ingestString(window.page_url)
            var app_title = ingestString(window.app_title)
            if (!page_url){
                page_url = '/'
            }
            if (!app_title){
                app_title = 'Landing Page'
            }
            window.history.pushState({state:'dummy state'}, app_title, page_url)
        }
    }

    return param_fields

}

function bindFunction(element_selector, function_name, function_args, function_group='') {
    
/* a method to bind a function to a click event */

//// construct client triggers property in window
//    if (!('client_triggers' in window)) {
//        window.client_triggers = {}
//    }    

// bind functions to click triggers
    if ($(element_selector).length) {
        
//    // determine trigger history path
//        var trigger_map = window.client_triggers
//        if (function_group){
//            if (!(function_group in window.client_triggers)){
//                window.client_triggers[function_group] = {}
//            }
//            trigger_map = window.client_triggers[function_group]
//        }
    
    // construct function and add binding
        var global_function = window[function_name]
        function_args = ingestArray(function_args)
        if (typeof(global_function) == 'undefined') {
              
            logConsole(sprintf('Function %s is not in the scope.', function_name))
        
        } else {  
//            trigger_map[element_selector] = true
            if (function_args.length) {
                $(element_selector).click(function(){
                    global_function(...function_args)
                })
            } else {
                $(element_selector).click(function(){
                    global_function()
                })
            }  
                
        }    
    }

}

function unbindListener(element_selector, group=false) {

/* a method to unbind a function or group of functions from a listener */
    
    if ('client_triggers' in window){
        if (element_selector in window.client_triggers){
            if (group){
                for (key in window.client_triggers[element_selector]){
                    if($(key).length){ $(key).off() }
                }
            } else { 
                if ($(element_selector).length){ $(element_selector).off() }
            }
            delete window.client_triggers[element_selector]        
        } 
    }

}

function clearListeners() {
    
/* a method to unbind all listeners in client triggers */

    if ('client_triggers' in window){
        for (key in window.client_triggers){
            if (ingestBoolean(window.client_triggers[key])){
                if ($(key).length){ $(key).off() }
            } else {
                const trigger_group = ingestMap(window.client_triggers[key])
                for (k in trigger_group){
                    if ($(k).length){ $(k).off()}
                }
            }
        }
        window.client_triggers = {}
    }
    
}

function updateHistory(func, args=null) {

/* a method for logging the navigation history of the client */
    
// construct client history
    if (!('client_history') in window){
        window.client_history = []
    }

// remove oldest history
    if (window.client_history.length > 49) {
        window.client_history.shift()
    }

// add new item
    window.client_history.push({ 'func': func, 'args': args })

}

function callFunction(callable, args=null) {

/* a method to invoke functions in the global scope */

    args = ingestArray(args)
    
    if (typeof(callable) == 'string') {
        var global_function = window[callable]
        if (typeof(global_function) == 'undefined') {     
            logConsole('Function ' + callable + ' is not in the global scope.')
        } else if (args.length) {
            global_function(...args)
        } else {
            global_function() 
        }
    } else if (args.length){
        callable(...args)
    } else {
        callable()
    }
    
}

function getFile(url) {

    var deferred = new $.Deferred()
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function(e){
        if (this.status == 200){
            var file_reader = new FileReader()
            file_reader.readAsDataURL(this.response)
            file_reader.onloadend = function() {
                deferred.resolve(file_reader.result)
            }
        } else {
            deferred.reject()
        }
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
    
    return deferred.promise()
                                                
}
