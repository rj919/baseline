__author__ = 'rcj1492'
__created__ = '2018.04'
__license__ = '©2018 Collective Acuity'

# create init path to sibling folders
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# initialize app and scheduler objects
from server.init import app, scheduler, api_model
from flask import request, session, jsonify, url_for, render_template, Response

# add cross origin support
from flask_cors import CORS
CORS(app)

# bundle and register js scripts and css styles in flask
# IMPORTANT NOTE:   postcss is not recognized in PyCharm's run environment
#                   use the command line to propagate changes to lab.scss
from flask_assets import Environment
from server.utils import bundle_modules, bundle_sheets
assets = Environment(app)
js_assets = [ 
    'js_assets',
    'scripts/jquery-3.1.1.min.js',
    'scripts/sprintf.min.js',
    'scripts/autosize.js',
    'scripts/bootstrap.min.js'
]
js_assets = bundle_modules(js_assets, app)
assets.register(*js_assets)
css_assets = [ 
    'css_assets',
    'styles/bootstrap.css',
    'styles/icomoon.css',
    'styles/simple-line-icons.css'
]
css_assets = bundle_sheets(css_assets, app)
assets.register(*css_assets)

# define jinja content
from labpack.records.settings import load_settings
main_details = load_settings('copy/main.json')
menu_details = load_settings('copy/menu.json')
landing_kwargs = {
    'menu': menu_details
}
landing_kwargs.update(**main_details)

# import request and response dependencies
from os import listdir, path
from hashlib import md5
from labpack.records.settings import load_settings
from labpack.parsing.flask import extract_request_details
from server.utils import construct_response, retrieve_flightplan, update_flightplan

@app.route('/')
def landing_page():
    ''' landing page route '''
    return render_template('dashboard.html', **landing_kwargs), 200

@app.route('/account', methods=['GET','POST'])
def profile_route():
    
    ''' profile page route '''
    
    request_details = extract_request_details(request)
    app.logger.debug(request_details)
    response_details = construct_response(request_details)
    access_token = request_details['params'].get('token', '')
    if not access_token:
        response_details['error'] = 'Access token is missing'
    if not response_details['error']:
        
        # retrieve flightplan
        if request_details['method'] == 'GET':
            flightplan_details = retrieve_flightplan(access_token)
            response_details['details'] = flightplan_details
        
        # update flightplan
        elif request_details['method'] == 'POST':
            success = update_flightplan(access_token, request_details['json'])
            response_details['details'] = { 'success': success }
            
    app.logger.debug(response_details)
    return jsonify(response_details), response_details['code']



@app.route('/api/v1')
def api_v1_route():
    ''' docs page route '''
    return jsonify(api_model), 200

@app.route('/api/v1/<resource_type>', methods=['GET','POST'])
def api_v1_resource_route(resource_type=''):
    pass

@app.route('/api/v1/<resource_type>/<resource_id>', methods=['GET','PUT','PATCH','DELETE'])
def api_v1_resource_id_route(resource_type='', resource_id=''):
    pass

# construct the catchall for URLs which do not exist
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', **landing_kwargs), 404

# attach app to scheduler and start scheduler
scheduler.init_app(app)
scheduler.start()

# initialize test wsgi localhost server with default memory job store
if __name__ == '__main__':
    from gevent.pywsgi import WSGIServer
    http_server = WSGIServer(('0.0.0.0', 5001), app)
    http_server.serve_forever()
    # app.run(host='0.0.0.0', port=5001)
