# Sign
webpack --watch


python server.py config.py


# Dev setup


**Requirements:** npm, virtualenv, python 3.4, imagemagick, and ghostscript, python-dev build-essential libfreetype6 libfreetype6-dev



2. create `catalex_sign` database
3. `npm install`
4. `virtualenv -p /usr/local/bin/python3.4 .`
5. `source bin/activate`
6. `python setup.py install`
7. `python migrate.py config_dev.py`

**NOTE:** figure out why seed isn't working

python setup.py install

python migrate.py config.py

# Backend tests

CONFIG_FILE=config_test.py python -m unittest discover

### Database

For testing we use a database schema dump to rebuild the database, rather than re-running migrations everytime we want to rebuild.

To generate the dump, run the following command from project root.

`pg_dump catalex_sign --schema-only --no-owner --no-acl > db_functions/seed.sql`



# deployment
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -


sudo service apache2 stop
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update

sudo apt-get install -y git nodejs python-certbot-nginx libjpeg-dev npm python3-pip python3-psycopg2 python3-dev imagemagick ghostscript python-dev build-essential libfreetype6 libfreetype6-dev postgresql postgresql-contrib nginx libpq-dev
sudo pip3 install --upgrade pip
sudo pip3 install virtualenv
sudo npm install -g npm webpack
sudo npm install -g yarn
sudo adduser --disabled-password sign

sudo touch /var/log/sign.log
sudo chown sign:sign /var/log/sign.log

sudo -u postgres createdb sign
// add new role with password

# if restoring
sudo -u postgres pg_restore -Ft -d sign sign.tar

cd /var/www/
sudo mkdir sign
sudo chown sign:sign sign
sudo -u sign git clone https://github.com/joshgagnon/document-signer.git sign

# copy sensitive config.py to sign dir
s
sudo su sign
cd sign
yarn install
virtualenv -p /usr/bin/python3.5 .
source bin/activate
pip install uwsgi
python setup.py install
python migrate.py config.py

# nginx conf

"""
server {
    listen 80 http2;
    server_name sign.catalex.nz;
    if (!-f /var/www/sign/serviceIsLive.flag) {
            return 503;
    }

    location /.well-known {
    alias /var/www/sign/public/.well-known;
    }
    client_body_in_file_only clean;
    client_body_buffer_size 32K;

    client_max_body_size 300M;

    sendfile on;
    send_timeout 300s;

    location / {
            include uwsgi_params;
            uwsgi_pass 127.0.0.1:5679;
    }

    error_page 503 @maintenance;

    location @maintenance {
        root /var/www/sign/src/static;
        rewrite ^(.*)$ /maintenance.html break;
    }
     gzip on;
     gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 9;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/x-font-woff application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

}
"""

sudo nginx -s reload


/etc/systemd/system/sign.service
"""
[Unit]
Description=Sign uwsgi
After=network.target

[Service]
ExecStart=/var/www/sign/bin/uwsgi  /var/www/sign/sign.ini
User=sign
Restart=always

[Install]
WantedBy=multi-user.target
"""

/var/www/sign/sign.ini
"""
[uwsgi]
socket = 127.0.0.1:5679
wsgi-file = server.py
pyargv = config.py
callable = app
processes = 4
threads = 2
logto = /var/log/sign.log
#virtualenv = /var/www/sign/
#pp = /var/www/sign/bin/python
wsgi-disable-file-wrapper = true
# set chdir for production
chdir = /var/www/sign
"""



sudo certbot --nginx