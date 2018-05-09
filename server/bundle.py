__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

def bundle_modules(logging_status='DEBUG'):
    
    js_bundles = []
    
    from flask_assets import Bundle
    from server.utils import compile_list
    project_modules = []
    lab_modules = []
    js_filters = [ 'uglifyjs' ]
    if logging_status == 'DEBUG':
        js_filters = [ ]
    for module in compile_list('assets/scripts'):
        lab_modules.append(module.replace('assets/','../assets/'))
    if lab_modules:
        js_bundles.append(Bundle(*lab_modules, filters=js_filters, output='scripts/lab.min.js'))
    for module in compile_list('scripts'):
        project_modules.append(module.replace('scripts/','../scripts/'))
    if project_modules:
        js_bundles.append(Bundle(*project_modules, filters=js_filters, output='scripts/project.min.js'))
    
    return js_bundles

def bundle_sheets(logging_status='DEBUG'):
    
    css_bundles = []
    
    from flask_assets import Bundle
    from server.utils import compile_list
    
    project_sheets = []
    lab_sheets = []
    css_filters = ['pyscss', 'autoprefixer6', 'cssmin']
    if logging_status == 'DEBUG':
        css_filters.pop()
    for sheet in compile_list('assets/styles'):
        lab_sheets.append(sheet.replace('assets/', '../assets/'))
    if lab_sheets:
        css_bundles.append(Bundle(*lab_sheets, filters=css_filters, output='styles/lab.min.css'))
    for sheet in compile_list('styles'):
        project_sheets.append(sheet.replace('styles/', '../styles/'))
    if project_sheets:
        css_bundles.append(Bundle(*project_sheets, filters=css_filters, output='styles/project.min.css'))
    
    return css_bundles

if __name__ == '__main__':

# grab args
    logging_status = 'DEBUG'
    import sys
    if len(sys.argv) > 1:
        logging_status = sys.argv[1]

# verify dependencies
    try:
        import jsmin
        import cssmin
    except Exception as err:
        print('bundling js and css requires python modules: jsmin, cssmin, pyscss\nas well as node modules: autoprefixer, postcss, uglify-js')
        sys.exit(0)

# expand system path
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# construct flask context
    from flask import Flask
    from flask_assets import Environment
    flask_kwargs = {
        'import_name': __name__,
        'static_folder': 'public',
        'template_folder': 'views'
    }
    app = Flask(**flask_kwargs)
    assets = Environment(app)

# run bundling
    js = bundle_modules(logging_status)
    css = bundle_sheets(logging_status)

# register assets
    assets.register(*['js_assets', js])
    assets.register(*['css_assets', css])

# start server
    from gevent.pywsgi import WSGIServer
    http_server = WSGIServer(('0.0.0.0', 5050), app)
    http_server.serve_forever()