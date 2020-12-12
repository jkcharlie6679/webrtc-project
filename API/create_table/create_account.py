import psycopg2, os, configparser


path = os.path.abspath('.')
cfgpath = path.split('API')[0] + 'API/config.ini'


config = configparser.ConfigParser()
config.read(cfgpath)


pg = psycopg2.connect(database = config['POSTGRES']['account_db'], user = config['POSTGRES']['user'], password = config['POSTGRES']['password'], host = config['POSTGRES']['host'], port = config['POSTGRES']['port'])

print ("Opened database successfully")

pgadmin = pg.cursor()

pgadmin.execute('''CREATE TABLE Account
       (I_Customer_ID SERIAL PRIMARY KEY NOT NULL,
       S_First_Name text NOT NULL,
       S_Last_Name text NOT NULL,
       S_Account text NOT NULL,
       S_Username text NOT NULL,
       S_Password text NOT NULL,
       I_Verify INT NOT NULL,
       D_Birthday DATE NOT NULL,
       S_Phone text NOT NULL,
       I_Open Integer NOT NULL);''')

pg.commit()
pg.close()

