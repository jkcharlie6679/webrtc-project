# webrtc

## Introduction
> This web uses the flask, nodejs to develop its backend the folder are API, server, and web_server, respectively in this respository.

## web API
> First we need to run the API using Python. Thera is a moudle list in API named 'requirements.txt'.
> After using `pip install` to install module we need to edit the `config.ini`.

> First, we need to run a PostSQL and create a table named 'account' then edit the host, port, username and password.
```pythono=1
[POSTGRES]

host = 192.168.1.123
port = 5431
user = postgres
password = 12345678

account_db = account
```
> Second, we need to change the path which the user's profile figure to save.
```pythono=1
[PATH]
file_path = /home/zhongyu/webrtc_data
no_file_path = /home/zhongyu/webrtc_data/origin.jpg
```
> Change the path where the folder you are.

> The next, we need to add the ssl files in the `webRTC/API` named 'certificate.crt' and 'private.key'.

> After that we can run the API in folder `webrtc/API` using `python create_table/create_account.py` to initial the table.
> The last, we use `python api.py` to run the server.

## WebRTC

> The WebRTC we uses nodejs to run, so we need to install 'nodejs' and using `npm install` to install the module we need to use.
> The next, we need to add the ssl files in the `webRTC/server/ssl` named 'certificate.crt' and 'private.key'.
> Ater we cahge the folder to `wertc/server/src` then can use `node app.js` to run the webRTC server.

## Nginx server
> First we need to add the ssl files in the `webRTC/server/ssl` named 'certificate.crt' and 'private.key'.
> The next, copy the files in `webrtc/web_server/web` to the `var/www/html` and edit the nginx config followong the file named `webrtc/web_server/default.conf`.
> After that we finish the step to establish our web.