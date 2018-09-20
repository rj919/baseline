__author__ = 'rcj1492'
__created__ = '2018.04'
__license__ = '©2018 Collective Acuity'

def render_email(html_template, server_domain, server_port=0, html_fields=None):
    
    ''' a method to render an email string using jinja template engine '''
    
# NOTE: method requires a flask context to find the templates to render
    
# define reference links
    server_protocol = 'https'
    if server_port:
        server_protocol = 'http'
    base_url = '%s://%s' % (server_protocol, server_domain)
    if server_port:
        base_url += ':%s' % server_port

# define email kwargs
    html_kwargs = {
        'base_url': base_url
    }
    if html_fields:
        html_kwargs.update(**html_fields)

# construct email html
    from flask import render_template
    email_html = render_template(html_template, **html_kwargs)

    return email_html

if __name__ == '__main__':

# construct main details
    from labpack.records.settings import load_settings
    main_details = load_settings('../copy/main.json')

# construct email client
    from labpack.email.mailgun import mailgunClient
    from labpack.handlers.requests import handle_requests
    mailgun_cred = load_settings('../../cred/mailgun.yaml')
    mailgun_kwargs = {
        'api_key': mailgun_cred['mailgun_api_key'],
        'email_key': mailgun_cred['mailgun_email_key'],
        'account_domain': mailgun_cred['mailgun_spf_route'],
        'requests_handler': handle_requests
    }
    email_client = mailgunClient(**mailgun_kwargs)

# construct flask context
    from flask import Flask
    flask_app = Flask(import_name=__name__, static_folder='../public', template_folder='../views')
    request_kwargs = {
        'method': 'GET'
    }

# construct email client
    with flask_app.test_request_context('/', **request_kwargs) as ctx:
        render_kwargs = {
            'html_template': 'emails/alert.html',
            'server_domain': 'baselinehq.herokuapp.com',
            # 'server_port': 5001,
            'html_fields': main_details
        }
        email_html = render_email(**render_kwargs)
    
    # compose test email
        email_kwargs = {
            'recipient_list': [ main_details['contacts']['email'] ], 
            'sender_email': main_details['contacts']['noreply'],
            'sender_name': 'The Travelers Companies',
            'email_subject': 'Thank You Enrolling in Travelers Home Insurance',
            'content_html': email_html
        }
        email_client.send_email(**email_kwargs)

    