import psycopg2, json, configparser, os, datetime
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_api import status
from SMTP import sent_mail
from Verification import generate_verification_code as Verify_Code



app = Flask(__name__)

path = os.path.abspath('.')
cfgpath = path.split('API')[0] + 'API/config.ini'

config = configparser.ConfigParser()
config.read(cfgpath)


@app.route(config['ROUTER']['app_router_account'] + '/Sign_up', methods = ['POST'])
@cross_origin()
def account_Sign_up():
    pg = psycopg2.connect(database = config['POSTGRES']['Account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    request_data = request.get_json()
    pgadmin.execute("SELECT * FROM Account WHERE S_Account = '%s';" %request_data['S_Account'])
    data_db = pgadmin.fetchall()
    pgadmin.execute("SELECT * FROM Account WHERE S_Username = '%s';" %request_data['S_Username'])
    data_db1 = pgadmin.fetchall()
    print(data_db, data_db1)

    if((len(data_db) == 1) & (len(data_db1)== 1)):
        data_json['S_Account'] = request_data['S_Account']
        data_json['S_Username'] = request_data['S_Username']
        data_json['S_Signup_Status'] = "1"
        data_json['S_Signup_Log'] = 'Account and Username existed'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST
    elif(len(data_db) == 1):
        data_json['S_Account'] = request_data['S_Account']
        data_json['S_Username'] = request_data['S_Username']
        data_json['S_Signup_Status'] = "2"
        data_json['S_Signup_Log'] = 'Account existed'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST
    elif(len(data_db1) == 1):
        data_json['S_Account'] = request_data['S_Account']
        data_json['S_Username'] = request_data['S_Username']
        data_json['S_Signup_Status'] = "3"
        data_json['S_Signup_Log'] = 'Username existed'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST

    INSERT = '''INSERT INTO Account(S_First_Name, S_Last_Name, S_Account, S_Username, S_Password, I_Verify, D_Birthday, S_Phone, I_Open) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)'''

    insert_data = (request_data['S_First_Name'], 
                    request_data['S_Last_Name'],
                    request_data['S_Account'],
                    request_data['S_Username'],
                    request_data['S_Password'],
                    '0',
                    request_data['D_Birthday'],
                    request_data['S_Phone'],
                    '0') 

    pgadmin.execute(INSERT, insert_data)
    pg.commit()

    data_json['S_Account'] = request_data['S_Account']
    data_json['S_Username'] = request_data['S_Username']
    data_json['S_Signup_Status'] = "0"
    data_json['S_Signup_Log'] = 'Sign up done'
    Verify = Verify_Code(6)
    data_json['S_Verify_Code'] = Verify
    sent_mail(request_data['S_Account'], Verify)

    return json.dumps(data_json), status.HTTP_200_OK


@app.route(config['ROUTER']['app_router_account'] + '/Login', methods = ['GET'])
@cross_origin()
def account_Login():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    S_Account = request.args.get("S_Account")
    S_Password = request.args.get("S_Password")
    pgadmin.execute("SELECT * FROM Account WHERE S_Account = '%s';" %S_Account)
    data_db = pgadmin.fetchall()

    if((S_Account == data_db[0][3]) & (S_Password == data_db[0][5]) & (data_db[0][6] == 1)):
        data_json['S_Account'] = S_Account
        data_json['S_Username'] = data_db[0][4]
        data_json['S_Login_Status'] = '0'
        data_json['S_Login_Log'] = 'Login Success'
        return json.dumps(data_json), status.HTTP_200_OK
    elif ((S_Account == data_db[0][3]) & (S_Password == data_db[0][5]) & (data_db[0][6] == 0)):
        data_json['S_Account'] = S_Account
        data_json['S_Username'] = data_db[0][4]
        data_json['S_Login_Status'] = '1'
        data_json['S_Login_Log'] = 'Please Verify your email account'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST
    elif ((S_Account == data_db[0][3]) & (S_Password != data_db[0][5])):
        data_json['S_Account'] = S_Account
        data_json['S_Login_Status'] = '2'
        data_json['S_Login_Log'] = 'Incorrect Password'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST

    if(len(data_db) == 0):
        data_json['S_Account'] = S_Account
        data_json['S_Login_Status'] = '3'
        data_json['S_Login_Log'] = 'Account does not exist'
        return json.dumps(data_json), status.HTTP_400_BAD_REQUEST      


@app.route(config['ROUTER']['app_router_account'] + '/edit', methods = ['GET', 'PUT'])
@cross_origin()
def account_edit():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    if request.method == 'GET':
        S_Account = request.args.get("S_Account")
        pgadmin.execute("SELECT * FROM Account WHERE S_Account = '%s';" %S_Account)
        data_db = pgadmin.fetchall()
        data_json['S_First_Name'] = data_db[0][1]
        data_json['S_Last_Name'] = data_db[0][2]
        data_json['S_Account'] = data_db[0][3]
        data_json['S_Username'] = data_db[0][4]
        data_json['S_Password'] = data_db[0][5]
        data_json['D_Birthday'] = str(data_db[0][7])
        data_json['S_Phone'] = data_db[0][8]
        return json.dumps(data_json), status.HTTP_200_OK

    elif request.method == 'PUT':
        request_data = request.get_json()
        pgadmin.execute("UPDATE account SET S_First_Name = '%s', S_Last_Name = '%s', S_Username = '%s', S_Password = '%s', D_Birthday = '%s', S_Phone = '%s' WHERE S_Account = '%s';" %(request_data['S_First_Name'], request_data['S_Last_Name'], request_data['S_Username'], request_data['S_Password'], request_data['D_Birthday'], request_data['S_Phone'], request_data['S_Account']))
        pg.commit()
        data_json['Edit_Status'] = '0'
        data_json['Edit_Log'] = 'Edit Success'
        return json.dumps(data_json), status.HTTP_200_OK

@app.route(config['ROUTER']['app_router_account'] + '/Verify', methods = ['PUT'])
@cross_origin()
def Account_Verify():
    pg = psycopg2.connect(database = config['POSTGRES']['Account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    request_data = request.get_json()

    if(request_data['S_Verifiy_Status'] == '1'):
        pgadmin.execute("UPDATE Account SET I_Verify = '1' WHERE S_Account = '%s'; " %request_data['S_Account'])
        pg.commit()

    data_json['S_Account'] = request_data['S_Account']
    data_json['S_Verifiy_Status'] = '0'
    data_json['S_Verifiy_Log'] = 'Verify Success'

    return json.dumps(data_json), status.HTTP_200_OK

@app.route(config['ROUTER']['app_router_account'] + '/open', methods = ['GET'])
@cross_origin()
def open():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    S_Account = request.args.get("S_Account")
    pgadmin.execute("SELECT * FROM Account WHERE S_Account = '%s';" %(S_Account))
    data_db = pgadmin.fetchall()
    data_json["S_Account"] = data_db[0][3]
    data_json["I_Room"] = data_db[0][0]
    pgadmin.execute("UPDATE Account SET I_Open = '1' WHERE S_Account = '%s';" %(S_Account))
    pg.commit()
    return json.dumps(data_json), status.HTTP_200_OK

@app.route(config['ROUTER']['app_router_account'] + '/open_list', methods = ['GET'])
@cross_origin()
def open_list():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_out = []
    pgadmin.execute("SELECT * FROM Account WHERE I_Open = '1';")
    data_db = pgadmin.fetchall()
    for i in range(len(data_db)):
        data_json = {}
        data_json["S_Account"] = data_db[i][3]
        data_json["S_Username"] = data_db[i][4]
        data_json["I_Room"] = data_db[i][0]
        data_out.append(data_json)


    return json.dumps(data_out), status.HTTP_200_OK

@app.route(config['ROUTER']['app_router_account'] + '/close', methods = ['GET'])
@cross_origin()
def close():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    S_Account = request.args.get("S_Account")
    pgadmin.execute("SELECT * FROM Account WHERE S_Account = '%s';" %(S_Account))
    data_db = pgadmin.fetchall()
    data_json["S_Account"] = data_db[0][3]
    data_json["I_Room"] = data_db[0][0]
    pgadmin.execute("UPDATE Account SET I_Open = '0' WHERE S_Account = '%s';" %(S_Account))
    pg.commit()
    return json.dumps(data_json), status.HTTP_200_OK
  

app.run(host='0.0.0.0', debug=True, ssl_context=('certificate.crt', 'private.key') )
# app.run(ssl_context='adhoc')
# app.run(host='0.0.0.0', debug=True)
