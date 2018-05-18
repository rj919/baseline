# flaskAPI 
_A RESTful API using Flask & APScheduler on Alpine & Gunicorn inside Docker_  
**by [Collective Acuity](http://collectiveacuity.com)**

## Features
- REST API architecture
- Auto-generated API endpoints
- Auto-generated API documentation
- Permission control using JWT
- APScheduler support
- WebClient framework
- REST API Client
- Configuration by Environmental Variables
- Lean Footprint

## Requirements
- Python and C dependencies listed in Dockerfile

## Components
- Alpine Edge (OS)
- Python 3.6.3 (Environment)
- Gunicorn 19.7.1 (Server)
- Flask 0.12.2 (Framework)
- APScheduler 3.5.0 (Scheduler)
- Gevent 1.2.2 (Thread Manager)
- SQLAlchemy 1.2.0 (Database ORM)

## Dev Env
- Docker (Provisioning)
- BitBucket (Version Control)
- Postgres (JobStore Database)
- PyCharm (IDE)
- Dropbox (Sync, Backup)

## Languages
- Python 3.6
- Javascript ES6

## Setup DevEnv
1. Install Docker on Local Device
2. Install Git on Local Device
3. Clone/Fork Repository
4. Install pocketlab: `pip install pocketlab`
5. Run `lab init api` in root folder 
6. Update Placeholder Credentials in /cred folder
7. Remove Unused Credentials from /cred folder
8. **[Optional]** Install heroku-cli

## Launch Commands
**Test with Docker locally:**
```
lab start
```

**Deploy to Heroku:**  
```sh
# create heroku account
heroku login
heroku auth:token
lab init --heroku
# update credentials in heroku.yaml
lab deploy heroku
```

**Deploy to EC2:**  
TODO

## Collaboration Notes
_The Git and Docker repos contain all the configuration information required for collaboration except access tokens. To synchronize access tokens across multiple devices, platforms and users without losing local control, you can use LastPass, an encrypted email platform such as ProtonMail or smoke signals. If you use any AWS services, use AWS IAM to assign user permissions and create keys for each collaborator individually. Collaborators are required to install all service dependencies on their local device if they wish to test code on their localhost. A collaborate should always **FORK** the repo from the main master and fetch changes from the upstream repo so reality is controlled by one admin responsible for approving all changes. New dependencies should be added to the Dockerfile, **NOT** to the repo files. Collaborators should test changes to Dockerfile locally before making a pull request to merge any new dependencies:_  

```
docker build -t test-image .
```

_.gitignore and .dockerignore have already been installed in key locations. To prevent unintended file proliferation through version control & provisioning, add/edit .gitignore and .dockerignore to include all new:_  

1. local environments folders
2. localhost dependencies
3. configuration files with credentials and local variables