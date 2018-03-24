__author__ = 'rcj1492'
__created__ = '2016.11'
__license__ = 'MIT'

'''
APScheduler Documentation
https://apscheduler.readthedocs.io/en/latest/index.html

APScheduler Trigger Methods
https://apscheduler.readthedocs.io/en/latest/modules/triggers/date.html
https://apscheduler.readthedocs.io/en/latest/modules/triggers/cron.html
https://apscheduler.readthedocs.io/en/latest/modules/triggers/interval.html

Flask_APScheduler Documentation
https://github.com/viniciuschiele/flask-apscheduler

Flask Documentation
http://flask.pocoo.org/docs/0.11/deploying/wsgi-standalone/#gevent
'''

# construct flask app object
from flask import Flask
flask_kwargs = {
    'import_name': __name__,
    'static_folder': 'public',
    'template_folder': 'views'
}
app = Flask(**flask_kwargs)

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
ap_scheduler = APScheduler(scheduler=gevent_scheduler)
