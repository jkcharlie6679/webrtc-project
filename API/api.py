import psycopg2, json, configparser, os, datetime
from flask import Flask, request
from flask_cors import CORS, cross_origin
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
    pgadmin.execute("SELECT * FROM Account")
    data_db = pgadmin.fetchall()

    INSERT = '''INSERT INTO Account(S_First_Name, S_Last_Name, S_Account, S_Username, S_Password, I_Verify, D_Birthday, S_Phone) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)'''

    for raw in data_db:
        if((request_data['S_Account'] == str(raw[3])) & (request_data['S_Username'] == raw[4])):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Username'] = request_data['S_Username']
            data_json['S_Signup_Status'] = "1"
            data_json['S_Signup_Log'] = 'Account and Username existed'
            return json.dumps(data_json), 400

        elif(request_data['S_Customer_Account'] == raw[3]):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Username'] = request_data['S_Username']
            data_json['S_Signup_Status'] = "2"
            data_json['S_Signup_Log'] = 'Account existed'
            return json.dumps(data_json), 400

        elif(request_data['S_Username'] == raw[4]):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Username'] = request_data['S_Username']
            data_json['S_Signup_Status'] = "3"
            data_json['S_Signup_Log'] = 'Username existed'
            return json.dumps(data_json), 400

    insert_data = (request_data['S_First_Name'], 
                    request_data['S_Last_Name'],
                    request_data['S_Account'],
                    request_data['S_Username'],
                    request_data['S_Password'],
                    '0',
                    request_data['D_Birthday'],
                    request_data['S_Phone']) 

    pgadmin.execute(INSERT, insert_data)
    pg.commit()

    data_json['S_Account'] = request_data['S_Account']
    data_json['S_Username'] = request_data['S_Username']
    data_json['S_Signup_Status'] = "0"
    data_json['S_Signup_Log'] = 'Sign up done'
    Verify = Verify_Code(6)
    data_json['S_Verify_Code'] = Verify
    sent_mail(request_data['S_Account'], Verify)

    return json.dumps(data_json), 200


@app.route(config['ROUTER']['app_router_account'] + '/Login', methods = ['POST'])
@cross_origin()
def account_Login():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    request_data = request.get_json()
    pgadmin.execute("SELECT * FROM Account")
    data_db = pgadmin.fetchall()

    for raw in data_db:
        if((request_data['S_Account'] == raw[3]) & (request_data['S_Password'] == raw[5]) & (raw[6] == 1)):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Username'] = raw[4]
            data_json['S_Login_Status'] = '0'
            data_json['S_Login_Log'] = 'Login Success'
            return json.dumps(data_json), 200
        elif ((request_data['S_Account'] == raw[3]) & (request_data['S_Password'] == raw[5]) & (raw[6] == 0)):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Username'] = raw[4]
            data_json['S_Login_Status'] = '1'
            data_json['S_Login_Log'] = 'Please Verify your email account'
            return json.dumps(data_json), 400
        elif ((request_data['S_Account'] == raw[3]) & (request_data['S_Password'] != raw[5])):
            data_json['S_Account'] = request_data['S_Account']
            data_json['S_Login_Status'] = '2'
            data_json['S_Login_Log'] = 'Incorrect Password'
            return json.dumps(data_json), 400
    
    data_json['S_Account'] = request_data['S_Account']
    data_json['S_Login_Status'] = '3'
    data_json['S_Login_Log'] = 'Account does not exist'
    return json.dumps(data_json), 400      


@app.route(config['ROUTER']['app_router_account'] + '/edit', methods = ['POST', 'PUT'])
@cross_origin()
def account_edit():
    pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])
    pgadmin = pg.cursor()
    data_json = {}
    request_data = request.get_json()
    pgadmin.execute("SELECT * FROM Account")
    data_db = pgadmin.fetchall()
    if request.method == 'POST':
        for raw in data_db:
            if(request_data['S_Account'] == raw[3]):
                data_json['S_First_Name'] = raw[1]
                data_json['S_Last_Name'] = raw[2]
                data_json['S_Account'] = raw[3]
                data_json['S_Username'] = raw[4]
                data_json['S_Password'] = raw[5]
                data_json['D_Birthday'] = str(raw[7])
                data_json['S_Phone'] = raw[8]
            return json.dumps(data_json), 200
    elif request.method == 'PUT':
        pgadmin.execute("UPDATE account SET S_First_Name = '%s', S_Last_Name = '%s', S_Username = '%s', S_Password = '%s', D_Birthday = '%s', S_Phone = '%s' WHERE S_Account = '%s';" %(request_data['S_First_Name'], request_data['S_Last_Name'], request_data['S_Username'], request_data['S_Password'], request_data['D_Birthday'], request_data['S_Phone'], request_data['S_Account']))
        pg.commit()
        data_json['Edit_Status'] = '0'
        data_json['Edit_Log'] = 'Edit Success'
        return json.dumps(data_json), 200

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

    return json.dumps(data_json), 200



app.run(host='0.0.0.0', debug=True )
