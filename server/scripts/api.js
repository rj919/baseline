/**
* VIEWS JAVASCRIPT EXTENSION
* @author rcj1492
* @license ©2017-2018 Collective Acuity
* @email support@collectiveacuity.com
* 
* requires: 
* jquery.js
* sprintf.js
* stackoverflow.js
* autosize.js
* lab.js
**/

// import $ from jquery
// import sprintf from sprintf
// import autosize from autosize
// import { syntaxHighlight } from stackoverflow

function registerHandler(input_selector, submit_callback) {

/* a method to bind a submission callback to an input field */

// define method variables
    var key_code;
    var input_value;
    
// block normal enter behavior
    $(input_selector).keypress(function( event ){
        key_code = event.keyCode
        if (key_code === 10 || key_code === 13){
            event.preventDefault();
        }
    })

// add typing event handler
    $(input_selector).keyup(function( event ){
    
    // retrieve key code
        key_code = event.keyCode;

    // retrieve input value
        if ($(this).get(0).isContentEditable){
            input_value = $(this).text()
        } else {
            input_value = $(this).val()
        }

    // initiate callbacks
        if ((key_code == 10 || key_code == 13)){

            submit_callback(input_value)
        
        }

    })

// add focus out handler
    $(input_selector).focusout(function( event ){

    // retrieve input value
        if ($(this).get(0).isContentEditable){
            input_value = $(this).text()
        } else {
            input_value = $(this).val()
        }
        
        submit_callback(input_value)
    
    })
        
}

function requestingResource(request_kwargs) {

/* a promise method to send an ajax request to server for a resource */

    var deferred = new $.Deferred()
    
// define catchall request outcome functions
    function _success_function(response) {
        logConsole('Request Successful.')
        window.device_online = true
        deferred.resolve(response)
    };
    function _error_function(response, exception) {
        const error_message = errorConstructor(response, exception)
        deferred.reject(error_message)
    };
    function _wait_function(){
        console.log('Waiting...')
    };
    
// construct resource url
    var request_route = ingestString(request_kwargs.route)
    var request_params = ingestMap(request_kwargs.params)
    var resource_url = window.server_url + request_route
    if (mapSize(request_params)){
        resource_url += '?'
        resource_url += $.param(request_params)
    }
    
// construct ajax request map
    var request_method = ingestString(request_kwargs.method)
    var ajax_map = {
        method: request_method,
        timeout: 12000,
        crossDomain: true,
        headers: {},
        url: resource_url,
        contentType: 'application/json',
        success: _success_function,
        error: _error_function
    }

// update success and error
    if (isFunction(request_kwargs.success)) {
        ajax_map.success = request_kwargs.success
    }
    if (isFunction(request_kwargs.error)) {
        ajax_map.error = request_kwargs.error
    }
    
// add body to request
    var request_body = ingestMap(request_kwargs.body)
    if (mapSize(request_body) && request_method != 'GET') {
        ajax_map.data = JSON.stringify(request_body)
    } 
    
// add headers to map
    var request_headers = ingestMap(request_kwargs.headers)
    for (var key in request_headers){
        ajax_map.headers[key] = request_headers[key]
    };

// send ajax request
    $.ajax(ajax_map)

// initialize wait function
    if (isFunction(request_kwargs.wait)){
        request_kwargs.wait()
    } else {
        _wait_function()
    }
    
    return deferred.promise()
    
}

function errorDialog(error_message) {

/* a method to construct a dialog to report errors */

// define method variables
    var dialog_title = ''
    var dialog_message = ''
    
// construct regex map
    var error_patterns = {
        invalid: new RegExp(/Access token is invalid/g),
        missing: new RegExp(/Access token is missing/g)
    }
    
// handle missing token
    if (error_patterns.missing.test(error_message)){
       
        dialog_title = 'Token Missing'
        dialog_message = 'To access this content, an access token is required. You can register your access token, using the "Register Token" button in the menu panel.'
        openBlank()
        
// handle invalid token
    } else if (error_patterns.invalid.test(error_message)){

        dialog_title = 'Token Invalid'
        dialog_message = 'The access token you have registered is not a valid token on record. Please double-check the value you have entered.'
        openBlank()
        
// handle catchall
    } else {

        dialog_title = 'Request Error'
        dialog_message = error_message

    }
    
// construct dialog html
    const dialog_html = sprintf('\
        <div class="col-xs-12 margin-vertical-10">\
            <div class="form-text auto-height text-wrap">%s</div>\
        </div>',
        dialog_message
    )

// construct flexible dialog
    var dialog_options = {
        title: dialog_title,
        body: dialog_html
    }
    flexibleDialog(dialog_options)
    
}

function registerDialog() {

/* a method to construct a dialog with an access token input field */

// retrieve access token
    var access_token = ingestString(localStorage.getItem('access_token'))
    
// construct dialog html
    var token_value = ''
    if (access_token){ token_value = ' value="' + access_token + '"'}
    const dialog_html = sprintf('\
        <div class="form-line text-left">\
            <div class="col-xs-12 margin-bottom-10">\
                <div class="form-text auto-height text-wrap">Policy Address:</div>\
            </div>\
            <div class="col-xs-12 margin-bottom-5">\
                <form title="Policy Address">\
                    <div class="row">\
                        <div class="col-xs-12">\
                            <label for="access_token_input" class="sr-only">Policy Address</label>\
                            <input id="access_token_input" type="text" autofocus class="form-input"%s>\
                        </div>\
                    </div>\
                </form>\
            </div>\
        </div>', 
        token_value
    )

// construct flexible dialog
    var dialog_options = {
        title: 'Update Address',
        body: dialog_html
    }
    flexibleDialog(dialog_options)

// construct selectors
    const background_selector = '#dialog_backdrop'
    const input_selector = '#access_token_input'
        
// define submission function
    function _token_submit(input_value){
        localStorage.setItem('access_token', input_value)
        $(background_selector).click()
    }
    
// add listeners
    registerHandler(input_selector, _token_submit)
    autofocusEnd(input_selector)
    
}

function updateTitle(title_kwargs) {

/* a method for updating the title fields */

// declare input schema
    var input_schema = {
        'schema': {
            'app_title': 'Baseline',
            'app_subtitle': 'A Claims Validation Platform',
            'page_title': 'Baseline',
            'page_label': 'A Claims Validation Platform',
            'center_desktop': false
        },
        'metadata': {
            'example_statements': [ 'update the title fields' ]
        }
    }

// ingest arguments
    var title_dict = input_schema.schema
    unpackKwargs(title_kwargs, title_dict, 'updateTitle')

// change page title
    var title_parts = document.title.split(' : ')
    if (title_dict.app_title){
        title_parts[0] = title_dict.app_title
    }
    if (title_dict.app_subtitle){
        title_parts[1] = title_dict.app_subtitle
    }
    document.title = title_parts.join(' : ')

// change header title
    var header_ids = [ '#header_title_desktop_text', '#header_title_mobile_text' ]
    for (var i = 0; i < header_ids.length; i++) {
        header_id = header_ids[i]
        if (!title_dict.page_label) {
        $(header_id).removeAttr('title')
        } else {
            $(header_id).attr('title', title_dict.page_label)
        }
        $(header_id).text(title_dict.page_title)
    }

// toggle header center
    var desktop_title_id = '#header_title_desktop'
    if (title_dict.center_desktop){
        $(desktop_title_id).removeClass('navbar-start')
        $(desktop_title_id).addClass('navbar-center')
    } else {
        $(desktop_title_id).removeClass('navbar-center')
        $(desktop_title_id).addClass('navbar-start')
    }

}

function openDocumentation(div_id='') {

// define documentation view
    function _open_documentation(doc_map){
        
    // toggle dashboard
        openDashboard()
    
    // replace title
        var title_kwargs = {
            app_title: window.app_title,
            app_subtitle: 'API Documentation',
            page_title: 'API Documentation',
            page_label: 'View API Documentation',
            center_desktop: true
        }
        updateTitle(title_kwargs)
        
    // toggle documentation container
        var record_key = 'documentation'
        var container_selector = '#documentation_container'
        var container_html = '<div id="documentation_container" class="container content-container-scroll"></div>'
        toggleView(container_selector, container_html)
    
    // inject doc map
        const doc_text = syntaxHighlight(JSON.stringify(doc_map, undefined, 2))
        const doc_html = '<pre class="text-wrap pre-json">' + doc_text + '</pre>'
        $(container_selector).html(doc_html)
        
    // scroll to div
        scrollDiv(div_id)
        
    }
    
// retrieve settings
    var access_token = ingestString()
    requestingResource({
        route: '/api/v1',
        method: 'GET'
    }).done(function(response){
        logConsole(response.schema)
        _open_documentation(response)
    })
    
}

function openReport(div_id='') {

// define documentation view
    function _open_report(doc_map=null){
        
    // toggle dashboard
        openDashboard()
    
    // replace title
        var title_kwargs = {
            app_title: window.app_title,
            app_subtitle: 'Data Report',
            page_title: 'Data Report',
            page_label: 'View Data Report',
            center_desktop: true
        }
        updateTitle(title_kwargs)
        
    // toggle documentation container
        var record_key = 'report'
        var container_selector = '#report_container'
        var container_html = '<div id="report_container" class="container content-container-scroll"></div>'
        toggleView(container_selector, container_html)
    
    // inject doc map
        const doc_text = syntaxHighlight(JSON.stringify(doc_map, undefined, 2))
        const doc_html = '<pre class="text-wrap pre-json">' + doc_text + '</pre>'
        $(container_selector).html(doc_html)
        
    // scroll to div
        scrollDiv(div_id)
        
    }
    
// retrieve api data
    var access_token = ingestString(localStorage.getItem('access_token'))
    requestingResource({
        route: '/api/v1',
        method: 'GET',
        params: { 'token': access_token }
    }).done(function(response){
        logConsole(response)
        _open_report(response.schema)
    }).fail(function(error){
        errorDialog(error)
    })

}

function openBlank() {
    
// toggle dashboard
    openDashboard()
    
// replace title
    var title_kwargs = {
        center_desktop: true
    }
    updateTitle(title_kwargs)
    
// toggle documentation container
    var record_key = 'blank'
    var container_selector = '#blank_container'
    var container_html = '<div id="blank_container" class="container content-container-fill"></div>'
    toggleView(container_selector, container_html)

// add semi-transparent logo
    var blank_html = '\
        <div id="center_middle" class="center-middle">\
            <img src="/public/images/logo.svg" class="icon-landing font-watermark"></a>\
        </div>'
    $(container_selector).html(blank_html)
    
}

function openDashboard() {

// remove landing container
    $('#landing_container').remove()
    
// toggle dashboard
    $('.dashboard-view').each(function(i){
        if (!($(this).is(':visible'))){
            $(this).show()   
        }
    })
    $('.landing-view').each(function(i){
        if ($(this).is(':visible')){
            $(this).hide()
        }
    })
    $('.header-border').addClass('navbar-border')
    $('.header-border').addClass('navbar-accent')

}

function landingView() {

// inject html
    const content_id = '#content'
    const logo_button_id = '#logo_button'
    const landing_html = '\
        <div id="landing_container">\
            <div id="center_middle" class="center-middle">\
                <div class="burst-effect">\
                    <a id="logo_button"><img src="/public/images/logo.svg" class="icon-thumb"></a>\
                </div>\
            </div>\
        </div>'
    $(content_id).html(landing_html)

// toggle dashboard
    $('.dashboard-view').each(function(i){
        if ($(this).is(':visible')){
            $(this).hide()   
        }
    })
    $('.landing-view').each(function(i){
        if (!($(this).is(':visible'))){
            $(this).show()
        }
    })
    $('.header-border').removeClass('navbar-border')
    $('.header-border').removeClass('navbar-accent')
    
// add listener
    $(logo_button_id).click(function(){
        openBlank()
    })

}

function signOut() {

// clear records in local storage
    for (var i = 0; i < localStorage.length; ++i ) {
        var record_key = localStorage.key(i)
        localStorage.removeItem(record_key)   
    }
    logConsole('All records deleted from Local Storage.')

// restore landing view
    landingView()
 
}

var device_handlers = {

// Handler Constructor
    initialize: function() {
    
        this.bindEvents();
        
    },
    
// Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
    },

// bind header functions
    bindHeaders: function() {
    
        // bind menu button
        $('#menu_button').click(function(){
            slideoutDialog('#dialog_menu', 'left')
        })
        
        // bind menu listeners
        menu_details = {
            "sections": [
                {
                  "actions": [
                    {
                      "icon": "icon-chart",
                      "name": "Report",
                      "onclick": "openReport",
                      "label": "View Data Report"
                    }
                  ]
                },
                {
                  "actions": [
                    {
                      "icon": "icon-home",
                      "name": "Policy Address",
                      "onclick": "registerDialog",
                      "label": "Change Policy Address"
                    },
                    {
                      "icon": "icon-doc",
                      "name": "Documentation",
                      "onclick": "openDocumentation",
                      "label": "View API Documentation"
                    },
                    {
                      "icon": "icon-logout",
                      "name": "Sign-Out",
                      "onclick": "signOut",
                      "label": "Sign Out from Laboratory"
                    }
                  ]
                },
                {
                  "actions": [
                    {
                      "icon": "icon-social-twitter",
                      "name": "Twitter",
                      "onclick": "open",
                      "args": [ "https://twitter.com/CollectiveAcuit" ],
                      "label": "Open Twitter Page"
                    },
                    {
                      "icon": "icon-social-facebook",
                      "name": "Facebook",
                      "onclick": "open",
                      "args": [ "https://www.facebook.com/collectiveacuity/" ],
                      "label": "Open Facebook Page"
                    }
                  ]
                }
              ]
        }
        menuBindings(menu_details)
        
        // bind info button
        $('#info_button').click(function(){
            var mission_details = {
                title: "Mission",
                description: "Statement of purpose for the laboratory.",
                effective_date: "2016.05.31.13.45.55",
                author: "Collective Acuity",
                details: "To make accessible to each individual the resources of the world."
            }
            blockquoteDialog(mission_details)
        })
        
        // add scroll to top binding to header
        $('#header_title_text_mobile, #header_title_text_desktop').click(function () {
            $('html, body').animate({scrollTop: 0}, 500)
        })

    },
    
// deviceoffline event handler
    onDeviceOffline: function() {
        window.device_online = false  // used in record retrieval logic
        console.log('Device Offline')
    },
    
// deviceonline event handler
    onDeviceOnline: function() {
        window.device_online = true  //used for record retrieval logic
        console.log('Device Online')
    },

// window variable creation
    constructWindow: function() {
    
    // set app details
        window.device_online = true
        window.system_environment = 'dev'
        window.app_title = 'Collective Acuity'
        
    // set server url components
        window.server_protocol = location.protocol
        window.server_domain = document.domain
        window.server_port = location.port
    
    // set server url
        window.server_url = window.server_protocol + '//' + window.server_domain
        if (window.server_port){
            window.server_url += ':' + window.server_port
        }
    
    },

// load async libraries
    loadLibraries: function() {
    
    // construct new promise
        var deferred = new $.Deferred()
        var library_promises = []
    
    // call library imports
        deferred.resolve()
        
        return deferred.promise()
        
    },
      
// parse view to open
    openView: function() {
    
    // retrieve params
        var param_fields = retrieveParams()
        
    // construct initial view based upon params
        if ('view' in param_fields){
        
            var view = param_fields['view']
            var section = ''
            if ('section' in param_fields){
                section = param_fields['section']
            }
            if (view == 'documentation'){
                openDocumentation(section)
            }
            
    // default to landing view
        } else {
            if (!$.trim($('#content').html())) {
                landingView()
            }
        }
    
    },
    
// deviceready Event Handler
    onDeviceReady: function() {
        
    // construct window
        device_handlers.constructWindow()
        
    // bind view header listeners
        device_handlers.bindHeaders()
    
    // load async libraries
        device_handlers.loadLibraries()
        
    // open entry view
        device_handlers.openView()
    
    // add online and offline handlers
        document.addEventListener('offline', device_handlers.onDeviceOffline, false);
        document.addEventListener('online', device_handlers.onDeviceOnline, false);
                
    // log state
        console.log('Device Ready') 
    
    }

}

device_handlers.initialize();