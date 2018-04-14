__author__ = 'rcj1492'
__created__ = '2016.11'
__license__ = 'MIT'

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
    LAB_SECRET_KEY = ''
    LAB_SERVER_PROTOCOL = 'http'
    LAB_SERVER_DOMAIN = 'localhost'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'DEBUG'
class flaskProd(object):
    LAB_SECRET_KEY = ''
    LAB_SERVER_PROTOCOL = 'https'
    LAB_SERVER_DOMAIN = 'api.collectiveacuity.com'
    LAB_SERVER_PORT = 5001
    LAB_SERVER_LOGGING = 'INFO'

# select flask config from system environment
if system_environment == 'dev':
    flask_app.config.from_object(flaskDev)
else:
    flask_app.config.from_object(flaskProd)
    
# initialize logging and debugging
import sys
import logging
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.DEBUG)
app.config['ASSETS_DEBUG'] = False

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
    'SCHEDULER_VIEWS_ENABLED': True
}

# adjust scheduler configuration settings based upon envvar
from server.methods.scheduler import config_scheduler
from labpack.records.settings import ingest_environ
scheduler_settings = ingest_environ('models/scheduler-model.json')
envvar_configuration = config_scheduler(scheduler_settings)
scheduler_configuration.update(envvar_configuration)

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