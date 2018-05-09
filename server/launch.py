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

from server.bundle import bundle_modules, bundle_sheets
js_bundle = bundle_modules(app.config['LAB_SERVER_LOGGING'])
css_bundle = bundle_sheets(app.config['LAB_SERVER_LOGGING'])

# register script and style assets in flask
from server.utils import compile_list
from flask_assets import Environment
assets = Environment(app)
js_assets = [ 
    'js_assets',
    'scripts/jquery-3.1.1.min.js',
    'scripts/sprintf.min.js',
    'scripts/autosize.js',
    'scripts/stackoverflow.js',
    'scripts/bootstrap.min.js'
]
js_assets.extend(js_bundle)
assets.register(*js_assets)
css_assets = [ 'css_assets' ]
for sheet in compile_list('public/styles'):
    css_assets.append(sheet.replace('public/',''))
# css_assets.extend(css_bundle)
assets.register(*css_assets)

# define jinja content
from labpack.records.settings import load_settings
main_details = load_settings('copy/main.json')
menu_details = load_settings('copy/menu.json')
landing_kwargs = {
    'menu': menu_details
}
landing_kwargs.update(**main_details)

@app.route('/')
def landing_page():
    ''' landing page route '''
    return render_template('dashboard.html', **landing_kwargs), 200

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
