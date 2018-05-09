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

if __name__ == '__main__':
    
    print(compile_list('assets/scripts'))