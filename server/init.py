__author__ = 'rcj1492'
__created__ = '2018.04'
__license__ = '©2018 Collective Acuity'

# retrieve system environment
from os import environ
system_environment = environ.get('SYSTEM_ENVIRONMENT', 'dev')

# retrieve credentials
from labpack.records.settings import load_settings
flask_config = load_settings('../cred/flask.yaml')
scheduler_config = {}

# construct flask app object
from flask import Flask
flask_kwargs = {
    'import_name': __name__,
    'static_folder': 'public',
    'template_folder': 'views'
}
app = Flask(**flask_kwargs)

# define flask environments
class flaskDev(object):
    LAB_SECRET_KEY = flask_config['flask_secret_key']
    LAB_SERVER_PROTOCOL = 'http'
    LAB_SERVER_DOMAIN = 'localhost'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'DEBUG'
    LAB_SQL_SERVER = 'sqlite:///../data/records.db'
    LAB_CASSANDRA_SERVER = ''
    LAB_JS_FILTERS = []
    LAB_CSS_FILTERS = [ 'pyscss', 'autoprefixer6' ]
    UGLIFYJS_EXTRA_ARGS = []
class flaskProd(object):
    LAB_SECRET_KEY = flask_config['flask_secret_key']
    LAB_SERVER_PROTOCOL = 'https'
    LAB_SERVER_DOMAIN = 'api.collectiveacuity.com'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'INFO'
    LAB_SQL_SERVER = 'sqlite:///../data/records.db' # add database to live postgres in production
    LAB_CASSANDRA_SERVER = '' # create keyspace in live cassandra in production

# select flask config from system environment
if system_environment in ('dev', 'mangle'):
    app.config.from_object(flaskDev)
    if system_environment == 'mangle':
        app.config['UGLIFYJS_EXTRA_ARGS'].extend(['-m', '--comments'])
        app.config['LAB_JS_FILTERS'].append('uglifyjs')
        app.config['LAB_CSS_FILTERS'].append('cssmin')
else:
    app.config.from_object(flaskProd)
    
# initialize logging and debugging
import sys
import logging
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.DEBUG)
app.config['ASSETS_DEBUG'] = False

# construct sql tables
sql_tables = None
# from labpack.databases.sql import sqlClient
# sql_tables = {
#     'settings': sqlClient('settings', app.config['LAB_SQL_SERVER'], load_settings('models/sql/settings.json'))
# }

# TODO construct cassandra tables

# TODO auto-generate construct api models
api_model = load_settings('models/api-model.json')

# construct scheduler object (with gevent processor)
from flask_apscheduler import APScheduler
from apscheduler.schedulers.gevent import GeventScheduler
gevent_scheduler = GeventScheduler()
scheduler = APScheduler(scheduler=gevent_scheduler)

# construct default scheduler configurations
from time import time
scheduler_configuration = {
    'SCHEDULER_JOBS': [ {
        'id': 'scheduler.debug.%s' % str(time()),
        'func': 'init:app.logger.debug',
        'kwargs': { 'msg': 'Scheduler has started.' },
        'misfire_grace_time': 5,
        'max_instances': 1,
        'replace_existing': False,
        'coalesce': True
    } ],
    'SCHEDULER_TIMEZONE': 'UTC',
    'SCHEDULER_VIEWS_ENABLED': False
}

# adjust scheduler configuration settings
from server.methods.scheduler import config_scheduler
scheduler_configuration.update(config_scheduler(scheduler_config))

# add jobs to pre-scheduled jobs
from server.jobs import job_list
from labpack.platforms.apscheduler import apschedulerClient
scheduler_client = apschedulerClient('http://localhost:5001')
for job in job_list:
    job_fields = scheduler_client._construct_fields(**job)
    standard_fields = {
        'misfire_grace_time': 5,
        'max_instances': 1,
        'replace_existing': True,
        'coalesce': True
    }
    job_fields.update(**standard_fields)
    scheduler_configuration['SCHEDULER_JOBS'].append(job_fields)

# add schedule fields to app configurations
app.config.update(**scheduler_configuration)