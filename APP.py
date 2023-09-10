from flask import Flask, render_template,request, Response
import time
import mysql.connector

#Jesus estuvo aqui :) xd 12
#wilkommen Jesus

print("Hello word")


# Configura la conexión a la base de datos


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('PRUEBA2.html')



def enviar_datos():

    while True:
        conexion = mysql.connector.connect(
            host = "locationdb.col4pixfadqv.us-east-2.rds.amazonaws.com",
            user = "root",
            password= "123456789",
            database= "LocationDB"
        )

        cursor = conexion.cursor()
        # Ejecuta una consulta SQL para obtener el último dato agregado
        cursor.execute("SELECT Latitud, Longitud, Estampa_de_tiempo FROM gps ORDER BY id DESC LIMIT 1")

        # Recupera el último dato agregado en ambas columnas
        ultima_fila = cursor.fetchone()

        # Imprime el resultado (esto puede variar dependiendo de tus columnas)
        #print("Último dato en columna1:", ultima_fila[0])
        #print("Último dato en columna2:", ultima_fila[1])
        #print("Último dato en columna3:", ultima_fila[2])
        
        nuevo_dato = f'{ultima_fila[0]}, {ultima_fila[1]},{ultima_fila[2]}'  # Datos enviados
        yield f'data: {nuevo_dato}\n\n'
        time.sleep(1)  # Controla la frecuencia de envío de datos
        conexion.close()
        stream()
        

        
@app.route('/stream')
def stream():
    return Response(enviar_datos(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run( host='172.31.39.140',port=3000)
