__author__ = 'rcj1492'
__created__ = '2018.05'
__license__ = '©2018 Collective Acuity'

def compile_list(folder_path, file_suffix=''):

    file_list = []

    from os import listdir, path
    for file_name in listdir(folder_path):
        file_path = path.join(folder_path, file_name)
        if path.isfile(file_path):
            if not file_suffix or file_name.find(file_suffix) > -1:
                file_list.append(file_path)

    return file_list

def bundle_modules(module_list, flask_app):

    if flask_app.config['LAB_SERVER_LOGGING'] != 'DEBUG':
        module_list.append('scripts/lab.min.js')
        module_list.append('scripts/project.min.js')
    else:
        from flask_assets import Bundle
        lab_modules = []
        project_modules = []
        js_bundles = []
        js_filters = flask_app.config['LAB_JS_FILTERS']
        for module in compile_list('assets/scripts'):
            lab_modules.append(module.replace('assets/','../assets/'))
        if lab_modules:
            js_bundles.append(Bundle(*lab_modules, filters=js_filters, output='scripts/lab.min.js'))
        for module in compile_list('scripts'):
            project_modules.append(module.replace('scripts/','../scripts/'))
        if project_modules:
            js_bundles.append(Bundle(*project_modules, filters=js_filters, output='scripts/project.min.js'))
        module_list.extend(js_bundles)

    return module_list

def bundle_sheets(sheet_list, flask_app):
    
    if flask_app.config['LAB_SERVER_LOGGING'] != 'DEBUG':
        sheet_list.append('styles/lab.min.css')
        sheet_list.append('styles/project.min.css')
    else:
        from flask_assets import Bundle
        lab_sheets = []
        project_sheets = []
        css_bundles = []
        css_filters = flask_app.config['LAB_CSS_FILTERS']
        for sheet in compile_list('assets/styles'):
            lab_sheets.append(sheet.replace('assets/', '../assets/'))
        if lab_sheets:
            css_bundles.append(Bundle(*lab_sheets, filters=css_filters, output='styles/lab.min.css'))
        for sheet in compile_list('styles'):
            project_sheets.append(sheet.replace('styles/', '../styles/'))
        if project_sheets:
            css_bundles.append(Bundle(*project_sheets, filters=css_filters, output='styles/project.min.css'))
        sheet_list.extend(css_bundles)
        
    return sheet_list

def construct_response(request_details, request_model=None, endpoint_list=None, ignore_errors=False, check_session=False):

    '''
        a method to construct fields for a flask response

    :param request_details: dictionary with details extracted from request object
    :param request_model: [optional] object with jsonmodel class properties
    :param endpoint_list: [optional] list of strings with acceptable route endpoints
    :param ignore_errors: [optional] boolean to ignore errors
    :param check_session: [optional] boolean to check for session
    :return: dictionary with fields for a flask response
    '''

# import dependencies
    from labpack.records.id import labID
    from labpack.parsing.flask import validate_request_content

# construct default response
    record_id = labID()
    response_details = {
        'dt': record_id.epoch,
        'id': record_id.id36,
        'code': 200,
        'error': '',
        'details': {}
    }

# validate request format
    if ignore_errors:
        return response_details
    if request_details['error']:
        response_details['error'] = request_details['error']
        response_details['code'] = request_details['code']
        return response_details
    if endpoint_list:
        from os import path
        route_root, route_endpoint = path.split(request_details['route'])
        if not route_endpoint in endpoint_list:
            from labpack.parsing.grammar import join_words
            response_details['error'] = 'request endpoint must be one of %s' % join_words(endpoint_list)
            response_details['code'] = 400
            return response_details
    if check_session:
        if not request_details['session']:
            response_details['error'] = 'request missing valid session token'
            response_details['code'] = 400
            return response_details
    if request_model:
        if not request_details['json']:
            response_details['error'] = 'request body must be content-type application/json'
            response_details['code'] = 400
        else:
            status_details = validate_request_content(request_details['json'], request_model)
            if status_details['error']:
                response_details['error'] = status_details['error']
                response_details['code'] = status_details['code']

    return response_details

def retrieve_flightplan(access_token, root_path='../data/'):
    
    from os import listdir, path
    from hashlib import md5
    from labpack.records.settings import load_settings
    
    flightplan_details = {}
    
    account_dir = listdir(root_path)
    hash_string = md5(access_token.encode('utf-8')).hexdigest()
    if hash_string in account_dir:
        flightplan_path = '../data/%s/flightplan.json' % hash_string
        flightplan_details = load_settings(flightplan_path)

        # construct image paths
        for waypoint in flightplan_details['waypoints']:
            base_dir_path = 'public/images/%s/%s%s' % (hash_string, waypoint['lat'], waypoint['lon'])
            for elevation in ('3','10','17'):
                image_dir_path = '%s/%s' % (base_dir_path, elevation)
                if path.exists(image_dir_path):
                    image_dir_list = listdir(image_dir_path)
                    for image in image_dir_list:
                        image_name, image_ext = path.splitext(image)
                        image_path = '/%s/%s' % (image_dir_path, image)
                        if not 'photos' in waypoint.keys():
                            waypoint['photos'] = []
                        photo_details = {
                            'date': image_name,
                            'elevation': int(elevation),
                            'src': image_path
                        }
                        waypoint['photos'].append(photo_details)
    
    return flightplan_details

def update_flightplan(access_token, flightplan_details):
    
    from os import listdir, path
    from hashlib import md5
    from labpack.records.settings import save_settings
    
    account_dir = listdir('../data/')
    hash_string = md5(access_token.encode('utf-8')).hexdigest()
    if hash_string in account_dir:
        flightplan_path = '../data/%s/flightplan.json' % hash_string
        save_settings(flightplan_path, flightplan_details)
        return True
    return False
    
if __name__ == '__main__':
    
    print(retrieve_flightplan('459 Old Stamford Road New Canaan, CT 06840'))