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

if __name__ == '__main__':
    
    print(compile_list('assets/scripts'))