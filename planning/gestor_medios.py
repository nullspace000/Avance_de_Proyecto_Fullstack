"""
Este programa gestiona listas de medios (películas, series, juegos) del usuario.
Permite consultar registros, agregar medios vistos, sugerir aleatoriamente medios por ver,
y mantener archivos separados para vistos y por ver.
"""
import random
import time
#Desarrollar un programa en Python que permita gestionar las películas, juegos, y series vistas y por ver 
print('\033[32m#############################')
print('# Gestor de Entretenimiento #')
print('#############################\033[0m')

def saludo_usuario():
    '''
    saludar a usuario por su nombre, si no existe el archivo o este está vacío -->
    crear archivo / escribir archivo
    '''
    try:
        with open("nombre_usuario.txt", "r", encoding="utf-8") as archivo:
            nombre = archivo.read().strip()
        if nombre:
            print(f"\033[32m\n¡Bienvenido {nombre}!\033[0m")
        else:
            nuevo_nom = input("\nPor favor ingrese su nombre: ")
            print(f"\033[32m\n¡Bienvenido {nuevo_nom}!\033[0m")
            with open("nombre_usuario.txt", "w", encoding="utf-8") as archivo:
                archivo.write(nuevo_nom)

    except FileNotFoundError:
        print("Error: Archivo faltante: nombre_usuario.txt")

#funciones de cada opción
#1. consultar registros
def consult_reg():
    '''
    consultar registros
    '''
    #loop to read files
    b = 1
    while b == 1:
        print('\n1. Película')
        print('2. Serie')
        print('3. Juego')
        print('4. Libros (en desarrollo)')
        print('5. Salir')
        elec = input('\n\033[33mTipo de medio (1-3): \033[0m')

        #case salir
        if elec == '5':
            b = 0
        #case movies
        if elec == '1':
            #loop to select watched and to watch
            c = 1
            while c ==1:
                print('\n1. Mostrar películas vistas')
                print('2. Mostrar películas por ver')
                print('3. Mostrar ambas')
                print('4. Salir')
                elec_b = input('\n\033[33m¿Qué películas mostrar? (1-3): \033[0m')

                #case movies watched
                if elec_b == '1':
                    #end loop c
                    c = 0
                    print('\033[32m\nPelículas vistas:\033[0m')
                    try:
                        with open("movies_watched.txt","r", encoding="utf-8") as archivo:
                            lines = archivo.readlines()
                        for x in lines:
                            line = x.strip().split(',')
                            print(f'\033[34mPelícula:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    except:
                        print('\033[31m\nError: Archivo faltante: movies_watched.txt \033[0m')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0

                #case movies to watch
                if elec_b == '2':
                    #end loop c
                    c = 0
                    print('\033[32m\nPelículas por ver:\033[0m')
                    try:
                        with open("movies_to_watch.txt","r", encoding="utf-8") as archivo:
                            lines = archivo.readlines()
                        for x in lines:
                            line = x.strip().split(',')
                            print(f'\033[34mPelícula:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    except:
                        print('\033[31m\nError: Archivo faltante: movies_to_watched.txt \033[0m')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0

                #case show both movies to watch and watched movies
                if elec_b == '3':
                    #end loop c
                    c = 0
                    try:
                        print('\033[32m\nPelículas por ver:\033[0m')
                        with open("movies_to_watch.txt","r", encoding="utf-8") as archivo:
                            lines = archivo.readlines()
                        for x in lines:
                            line = x.strip().split(',')
                            print(f'\033[34mPelícula:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    except:
                        print('\033[31m\nError: Archivo faltante: movies_to_watched.txt \033[0m')
                    print('\033[32m\nPelículas vistas:\033[0m')
                    try:
                        with open("movies_watched.txt","r", encoding="utf-8") as archivo:
                            lines = archivo.readlines()
                        for x in lines:
                            line = x.strip().split(',')
                            print(f'\033[34mPelícula:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    except:
                        print('\033[31m\nError: Archivo faltante: movies_watched.txt \033[0m')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0
        
        #case series
        if elec == '2':
            #loop to select watched and to watch
            c = 1
            while c ==1:
                print('\n1. Mostrar series vistas')
                print('2. Mostrar series por ver')
                print('3. Mostrar ambas')
                elec_b = input('\n\033[33m¿Qué series mostrar? (1-3): \033[0m')

                if elec_b == '1':
                    #end loop c
                    c = 0
                    print('\033[32m\nSeries vistas:\033[0m')
                    with open("shows_watched.txt","r", encoding="utf-8") as archivo:
                        lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mSerie:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0

                if elec_b == '2':
                    #end loop c
                    c = 0
                    print('\033[32m\nSeries por ver:\033[0m')
                    with open("shows_to_watch.txt","r", encoding="utf-8") as archivo:
                        lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mSerie:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0
                    
                if elec_b == '3':
                    #end loop c
                    c = 0
                    print('\033[32m\nSeries por ver:\033[0m')
                    with open("shows_to_watch.txt","r", encoding="utf-8") as archivo:
                        lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mSerie:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    print('\033[32m\nSeries vistas:\033[0m')
                    with open("shows_watched.txt","r", encoding="utf-8") as archivo:
                        lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mSerie:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0

        #case juegos
        if elec == '3':
            #loop to select watched and to watch
            c = 1
            while c ==1:
                print('\n1. Mostrar juegos jugados')
                print('2. Mostrar juegos por jugar')
                print('3. Mostrar ambos')
                elec_b = input('\n\033[33m¿Qué juegos mostrar? (1-3): \033[0m')

                if elec_b == '1':
                    #end loop c
                    c = 0
                    print('\033[32m\nJuegos jugados:\033[0m')
                    with open("games_played.txt","r", encoding="utf-8") as archivo:
                        lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mJuego:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0

                if elec_b == '2':
                    #end loop c
                    c = 0
                    print('\033[32m\nJuegos por jugar:\033[0m')
                    with open("games_to_play.txt","r", encoding="utf-8") as archivo:
                         lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mJuego:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0
                    
                if elec_b == '3':
                    #end loop c
                    c = 0
                    print('\033[32m\nJuegos por jugar:\033[0m')
                    with open("games_to_play.txt","r", encoding="utf-8") as archivo:
                         lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mJuego:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    print('\033[32m\nJuegos jugados:\033[0m')
                    with open("games_played.txt","r", encoding="utf-8") as archivo:
                         lines = archivo.readlines()
                    for x in lines:
                        line = x.strip().split(',')
                        print(f'\033[34mJuego:\033[0m {line[0].capitalize()} \033[34mRazón:\033[0m {line[1].capitalize()}')
                    sn = input('\033[33m\n¿Mostrar otras listas? (s/n): \033[0m')
                    if sn in ('n', 'N'):
                        b = 0
#rewrite files in alphabetical order
def ordenar_medios():
    '''
    rewrite files in alphabetical order
    '''
    def sort_name_file(filename):
        # open file and read all lines
        with open(filename, "r", encoding="utf-8") as archivo:
            lines = archivo.readlines()
        #sort lines by name (before split","")
        lines.sort(key=lambda line: line.split(",")[0].strip().lower())
        #rewrite the file with sorted lines
        with open(filename, "w", encoding="utf-8") as archivo:
            archivo.writelines(lines)
        print(f"\033[32m'{filename}' ha sido ordenado alfabeticamente. \033[0m")
    #sort each txt file
    sort_name_file("games_played.txt")
    sort_name_file("games_to_play.txt")
    sort_name_file("movies_to_watch.txt")
    sort_name_file("movies_watched.txt")
    sort_name_file("shows_to_watch.txt")
    sort_name_file("shows_watched.txt")

#2. registrar nueva serie/película/juego por jugar/ver
def add_pice(media_type,file):
    '''
    función add media to media to watch
    '''
    titulo = input(f'\033[33m\nTítulo de {media_type}: \033[0m')
    titulo = titulo.lower()
    razon = input('\033[33m\nRazón para ver/jugar: \033[0m')
    razon = razon.lower()
    with open(file,"a+", encoding="utf-8") as archivo:
        archivo.write(f"{titulo},{razon}\n")
    print(f'\033[32m\n{media_type} agregad@ con éxito :) \033[0m')

def add_por_ver():
    '''
    loop to add media to their respective files
    '''
    b = 1
    while b == 1:
        print('\n1. Película')
        print('2. Serie')
        print('3. Juego')
        print('4. Libro (en desarrollo)')
        print('5. Salir')
        elec = input('\n\033[33mTipo de medio (1-3): \033[0m')
        #case salir
        if elec == '5':
            b = 0
        #case add movie
        if elec == '1':
            add_pice("Película","movies_to_watch.txt")
            sn = input('\033[33m\n¿Agregar otra obra? (s/n): \033[0m')
            if sn in ('n', 'N'):
                #exit loop
                b = 0

        #case add show
        if elec == '2':
            add_pice("Serie","shows_to_watch.txt")
            sn = input('\033[33m\n¿Agregar otra obra? (s/n): \033[0m')
            if sn in ('n', 'N'):
                #exit loop
                b = 0

        #case add game
        if elec == '3':
            add_pice("Game","games_to_play.txt")
            sn = input('\033[33m\n¿Agregar otra obra? (s/n): \033[0m')
            if sn in ('n', 'N'):
                #exit loop
                b = 0

#3. registrar medio visto, si está en medios por ver, eliminar
def add_medio_visto_tipo(media_type,towatch_file,watched_file):
    '''
    3. registrar medio visto, si está en medios por ver, eliminar
    '''
    titulo = input(f'\033[33m\nTítulo de {media_type}: \033[0m')
    titulo = titulo.lower()
    parte_fav = input('\033[33m\nParte favorita: \033[0m')
    #bucle set score
    e = 1
    while e == 1:
        score = int(input('\n1. Me encantó\n2. Me gustó\n3. No me gustó\n\n\033[33mGusto?: \033[0m'))
        if 0 < score < 4:
            e = 0
    # quitar película de películas por ver
    with open(towatch_file, "r", encoding="utf-8") as archivo:
        lines = archivo.readlines()
    line_to_remove = None
    for line in lines:
        # split line at ','
        arr = line.strip().split(",")
        # compare titles (case-insensitive)
        if arr[0].lower() == titulo:
            line_to_remove = line
            # stop after first match
            break
    #if line_to_remove is not empty, rewrite file without line_to_remove
    if line_to_remove:
        with open(towatch_file, "w", encoding="utf-8") as archivo:
            for line in lines:
                if line != line_to_remove:
                    archivo.write(line)
    #check if title already exists in movies_watched.txt
    already_existst = 0
    with open(watched_file, "r", encoding="utf-8") as archivo:
        lines = archivo.readlines()
    line_to_remove = None
    #check line by line:
    for line in lines:
        # split line at ','
        arr = line.strip().split(",")
        # compare titles (case-insensitive)
        if arr[0].lower() == titulo:
            already_existst = 1
    #agregar película a peliculas vistas
    if already_existst == 0:
        with open(watched_file,"a+", encoding="utf-8") as archivo:
            archivo.write(f"{titulo},{parte_fav},{score}\n")
        print(f'\033[32m\n{media_type} agregada con éxito :) \033[0m')

#actual function that is called from the main menu
def reg_medio_visto():
    '''
    actual function that is called from the main menu
    '''
    c = 1
    while c == 1:
        print('\n1. Película')
        print('2. Serie')
        print('3. Juego')
        print('4. Salir')
        elec = input('\n\033[33mTipo de medio (1-3): \033[0m')

        #case salir
        if elec == '4':
            c = 0
        #case add movie
        if elec == '1':
            add_medio_visto_tipo("Película","movies_to_watch.txt","movies_watched.txt")
            sn = input('\033[33m\n¿Agregar otra obra a vistos? (s/n): \033[0m')
            if sn in ('n', 'N'):
            #exit loop
                c = 0

        #case add show
        if elec == '2':
            add_medio_visto_tipo("Serie","shows_to_watch.txt","shows_watched.txt")
            sn = input('\033[33m\n¿Agregar otra obra a vistos? (s/n): \033[0m')
            if sn in ('n', 'N'):
            #exit loop
                c = 0

        #case add show
        if elec == '3':
            add_medio_visto_tipo("Juego","games_to_play.txt","games_played.txt")
            sn = input('\033[33m\n¿Agregar otra obra a vistos? (s/n): \033[0m')
            if sn in ('n', 'N'):
            #exit loop
                c = 0

#5. sugest random towatch peace of media
def sugest_ran_towatch():
    '''
    5. sugest random towatch peace of media
    '''
    c = 1
    while c == 1:
        print('\n1. Película')
        print('2. Serie')
        print('3. Juego')
        print('4. Salir')
        elec = input('\n\033[33mTipo de medio (1-3): \033[0m')

        #case salir
        if elec == '4':
            c = 0
        #case movie
        if elec == '1':
            d = 1
            while d == 1:
                with open("movies_to_watch.txt","r", encoding="utf-8") as archivo:
                    lines = archivo.readlines()
                #generate random number between the values of 1 and the number of lines
                num = random.randint(0, len(lines)-1)
                #read line corresponding to the random number as an index
                line = lines[num].split(',')
                print(f'\033[34m\nSugerencia:\033[0m {line[0].capitalize()}')
                print(f'\033[34mRazón:\033[0m {line[1].capitalize()}')
                #exit loop
                sn = input('\033[33m¿Otra sugerencia? (s/n): \033[0m')
                if sn in ('n', 'N'):
                #exit loop
                    d = 0
                c = 0

        #case show
        if elec == '2':
            d = 1
            while d == 1:
                with open("shows_to_watch.txt","r", encoding="utf-8") as archivo:
                    lines = archivo.readlines()
                #generate random number between the values of 1 and the number of lines
                num = random.randint(0, len(lines)-1)
                #read line corresponding to the random number as an index
                line = lines[num].split(',')
                print(f'\033[34m\nSugerencia:\033[0m {line[0].capitalize()}')
                print(f'\033[34mRazón:\033[0m {line[1].capitalize()}')
                #exit loop
                sn = input('\033[33m¿Otra sugerencia? (s/n): \033[0m')
                if sn in ('n', 'N'):
                #exit loop
                    d = 0
                c = 0

        #case movie
        if elec == '3':
            d = 1
            while d == 1:
                with open("games_to_play.txt","r", encoding="utf-8") as archivo:
                    lines = archivo.readlines()
                #generate random number between the values of 1 and the number of lines
                num = random.randint(0, len(lines)-1)
                #read line corresponding to the random number as an index
                line = lines[num].split(',')
                print(f'\033[34m\nSugerencia:\033[0m {line[0].capitalize()}')
                print(f'\033[34mRazón:\033[0m {line[1].capitalize()}')
                #exit loop
                sn = input('\033[33m¿Otra sugerencia? (s/n): \033[0m')
                if sn in ('n', 'N'):
                #exit loop
                    d = 0
                c = 0
#barra de carga
print("\nCargando: |===>                      |")
time.sleep(1)
print("Cargando: |=========>                |")
time.sleep(0.5)
print("Cargando: |=====================>    |")
time.sleep(0.2)
print("Cargando: |========================> |")
time.sleep(0.2)
print("Cargando: |=========================>|")


#saludar a usuario
saludo_usuario()

#menú principal
A = 1
while A == 1:
    print('\n\033[34mMenú principal: \033[0m')
    print('1. Mostrar obras')
    print('2. Ordenar obras alfabéticamente')
    print('3. Registrar obra por ver/jugar')
    print('4. Registrar obra vista')
    print('5. Sugerir obra por ver aleatoria')
    print('6. Salir')
    #try:
    eleccion = input('\033[33m\n¿Qué opcion elige?: \033[0m')
    #caso 1
    if eleccion == '1':
        consult_reg()
    #caso 2
    if eleccion == '2':
        print('Ordenando medios alfabeticamente...')
        ordenar_medios()
    #caso 3
    if eleccion == '3':
        add_por_ver()
    #caso 4
    if eleccion == '4':
        reg_medio_visto()

    #caso 5
    if eleccion == '5':
        sugest_ran_towatch()

    #caso 6
    if eleccion == '6':
        print('\033[32m\nSaliendo...\033[0m')
        A = 0
