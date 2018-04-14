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
* lab.js
**/

// import $ from jquery
// import sprintf from sprintf
// import { syntaxHighlight } from stackoverflow

function slideoutDialog(dialog_id, dialog_side) {

/* a method to animate a slideout dialog */
    
// define menu variables
    var backdrop_id = '#dialog_backdrop'
    var active_id = dialog_id
    var active_links = dialog_id + ' a'
    var out_class = 'slideout-' + dialog_side
    var back_class = 'slideback-' + dialog_side

// show menu dialog
    $(backdrop_id).show()
    $(active_id).show()
    $(active_id).addClass(out_class)

// define close function
    function _close_dialog(){
        $(backdrop_id).hide()
        $(backdrop_id).off()
        $(active_id).removeClass(out_class)
        $(active_id).addClass(back_class)
        setTimeout(function(){
            $(active_id).hide()
            $(active_id).removeClass(back_class)
        }, 150)
    }

// bind event handlers to close dialogs
    $(active_links).click(function(){
        _close_dialog()
    });
    $(backdrop_id).click(function(){
        _close_dialog()
    });

}

function flexibleDialog(options=null) {

/* a method to display text in a responsive dialog panel */

// ingest variables
    var dialog_options = ingestMap(options)
    var title = ingestString(dialog_options.title)
    var body = ingestString(dialog_options.body)
    var keep_open = ingestBoolean(dialog_options.keep_open)

// construct dialog html
    var dialog_html = sprintf('\
        <div id="flexible_dialog_box" class="dialog-flexible">\
            <div class="container-fluid">\
                <div class="row navbar">\
                    <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2"></div>\
                    <div class="col-lg-8 col-md-8 col-sm-8 col-xs-8">\
                        <div id="flexible_dialog_title" class="navbar-title-24 navbar-center">%s</div>\
                    </div>\
                    <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2">\
                        <div class="navbar-title-24 navbar-end">\
                            <a id="flexible_dialog_close" title="Close Button" class="icon-close font-sm float-middle"></a>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="flexible_dialog_body" class="container-fluid margin-bottom-10">%s</div>\
        </div>',
        title, body
    )

// define selectors
    var dialog_box_selector = '#flexible_dialog_box'
    var dialog_title_selector = '#flexible_dialog_title'
    var dialog_close_selector = '#flexible_dialog_close'
    var dialog_body_selector = '#flexible_dialog_body'
    var dialog_backdrop_selector = '#dialog_backdrop'

// remove previous dialogs
    if ($(dialog_box_selector).length){ $(dialog_box_selector).remove() }

// inject DOM with html content
    $(dialog_backdrop_selector).show();
    $('body').append(dialog_html);

// define close function
    function _close_dialog(){
        $(dialog_backdrop_selector).hide();
        $(dialog_box_selector).remove();
    }
    
// bind event handlers to close dialogs
    if (keep_open){
        $(dialog_close_selector).click(_close_dialog)
    } else {
        $(dialog_box_selector).find('a').each(function(i, a){
            $(a).click(_close_dialog)
        })
    }
    $(dialog_backdrop_selector).click(_close_dialog)
        
}

function blockquoteDialog(blockquote_kwargs) {

/* a method to display blockquote information in a responsive dialog */

// define string variables
    var title_text = ingestString(blockquote_kwargs.title)
    var div_id = title_text.toLowerCase().replace(/\s/g, '_')
    var div_title = ingestString(blockquote_kwargs.description)
    var content_text = ingestString(blockquote_kwargs.details)
    var author_text = ingestString(blockquote_kwargs.author)

// construct html content from variables
    var content_html = sprintf('\
        <div id="%s_details" class="font-sm text-left" title="%s">\
            <blockquote class="blockquote-reverse">\
                <p>%s</p>\
                <footer>%s</footer>\
            </blockquote>\
        </div>',
        div_id, div_title, content_text, author_text
    )

// open dialog window
    var dialog_options = {
        title: title_text,
        body: content_html
    }
    flexibleDialog(dialog_options)

}

function menuBindings(menu_details) {

/* a method to initialize bindings for the menu actions */
    
    const section_list = ingestArray(menu_details.sections)
    for (var i=0; i < section_list.length; i++){
        const action_list = ingestArray(section_list[i].actions)
        for (var j=0; j < action_list.length; j++){
            const action_name = ingestString(action_list[j].name).toLowerCase().replace(/\s/g, '_');
            if (action_name){
            
                var function_name = ingestString(action_list[j].onclick)
                var function_args = ingestArray(action_list[j].args)
                var menu_selector = '#menu_action_' + action_name + '_link'
                bindFunction(menu_selector, function_name, function_args)
                
            }
            
        }
    }
    
}

function toggleView(view_id, view_html) {

/* a method to toggle between different content containers */

// convert id into selector
    if (view_id.indexOf('#') != 0){
        view_id = '#' + view_id
    }
    
// hide existing views
    $('#content').children().each(function(){
        $(this).hide()
    });
    
// if view doesn't already exist, add it
    if (!$(view_id).length) {
        $('#content').append(view_html)
// if view exists already, show it
    } else {
        $(view_id).show()
    }

}

function scrollDiv(div_id) {

/* a method to scroll to a specific element id on the page */

// TODO find out why scrollTop fails in same view

    if (div_id){
        
        var div_selector = '#' + div_id
        if ($(div_selector).length){
    //        parent.location.hash = div_id
            var header_height = $('#header_container').css('height')
            var header_value = parseInt(header_height.slice(0, -2))
            var scroll_height = $(div_selector).offset().top - header_value
            $('html, body').animate({ scrollTop: scroll_height }, 1)
        }
        
    } else {
        $('html, body').animate({ scrollTop: 0 }, 1)
    }
    
}

function updateTitle(title_kwargs) {

/* a method for updating the title fields */

// declare input schema
    var input_schema = {
        'schema': {
            'app_title': 'Collective Acuity',
            'app_subtitle': 'Welcome to the Laboratory',
            'page_title': 'Collective Acuity',
            'page_label': 'A Machine Intelligence Laboratory'
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
    var header_ids = [ '#header_title_text_mobile', '#header_title_text_desktop' ]
    for (var i = 0; i < header_ids.length; i++) {
        header_id = header_ids[i]
        if (!title_dict.page_label) {
        $(header_id).removeAttr('title')
        } else {
            $(header_id).attr('title', title_dict.page_label)
        }
        $(header_id).text(title_dict.page_title)
    }

}

function errorConstructor(response, exception) {

/* a method for handling an error in an ajax response */

// retrieve variables from response
    var response_code = response.status
    var response_body = {}
    try {
        response_body = JSON.parse(response.responseText)
    } catch(e) { }

// construct message from error codes
    var message_content = 'Errr! '
    if (response_code === 0) {
        message_content += 'No connection. Check network settings.'
        window.device_online = false
    } else if (response_code == 404) {
        message_content += 'Page not found. [404]'
    } else if (response_code == 500) {
        message_content += 'Internal Server Error [500].'
    } else if (exception === 'timeout') {
        message_content += 'Request timeout.'
    } else if (exception === 'abort') {
        message_content += 'Request aborted.'
    } else if (mapSize(ingestMap(response_body))) {
        if (ingestString(response_body.error)) {
            message_content += response_body.error
        }
    }

// report error to console log
    console.log(message_content);

// return message
    return message_content;

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
            page_label: 'View API Documentation'
        }
        updateTitle(title_kwargs)
        
    // toggle documentation container
        var record_key = 'documentation'
        var container_selector = '#documentation_container'
        var container_html = '<div id="documentation_container" class="container content-container-scroll"></div>'
        toggleView(container_selector, container_html)
    
    // inject doc map
        const doc_text = syntaxHighlight(JSON.stringify(doc_map.schema, undefined, 2))
        const doc_html = '<pre class="text-wrap pre-json">' + doc_text + '</pre>'
        $(container_selector).html(doc_html)
        
    // scroll to div
        scrollDiv(div_id)
        
    }
    
// retrieve documentation
    requestingResource({
        route: '/api/v1',
        method: 'GET'
    }).done(function(response){
        logConsole(response)
        _open_documentation(response)
    })
    
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

}

function landingView() {

// inject html
    const content_id = '#content'
    const logo_button_id = '#logo_button'
    const landing_html = '\
        <div id="landing_container">\
            <div id="center_middle" class="center-middle">\
                <div class="burst-effect">\
                    <a id="logo_button"><img src="/public/images/lab-logo.svg" class="icon-thumb"></a>\
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
    
// add listener
    $(logo_button_id).click(function(){
        openDocumentation()
    })

}

function signOut() {

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
                      "icon": "icon-docs",
                      "name": "Documentation",
                      "onclick": "openDocumentation",
                      "label": "View API Documentation"
                    }
                  ]
                },
                {
                  "actions": [
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