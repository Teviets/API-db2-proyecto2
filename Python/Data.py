import pandas as pd
from neo4j import GraphDatabase
from py2neo import Graph, Node, Relationship
import fake as fk
import random as rm

# funte de datos:
# https://www.kaggle.com/datasets/sudhanshuy17/popular-tv-shows-data-set?resource=download
# https://github.com/ankoorb/IMDB/blob/master/tv_shows.csv

# Limpieza
# Lectura de csv
tv1 = pd.read_csv("1.csv")
tv2 = pd.read_csv("2.csv")

# eleiminar columna id de tv2
tv2 = tv2.drop(columns=['id'])
tv2 = tv2.drop(columns=['original_language'])
tv2 = tv2.drop(columns=['Unnamed: 0'])
tv1 = tv1.drop(columns=['Unnamed: 0'])
tv1 = tv1.drop(columns=['year'])

# join de tv1 y tv2 cuando title de tv1 sea igual a name de tv2
tv = tv1.join(tv2.set_index('name'), on='title')

# hacer split de la columna genre por , y crear una nueva columna por cada genero en la que tenga una lista de generos
genres = tv['genre']

tv['genre'] = tv['genre'].str.replace(' ', '')
tv['genre'] = tv['genre'].str.replace('[', '')
tv['genre'] = tv['genre'].str.replace(']', '')
tv['genre'] = tv['genre'].str.replace("'", '')
tv['genre'] = tv['genre'].str.replace('u', '')
tv['genre'] = tv['genre'].str.split(',')


# obtener todos los generos de manera que no se repitan
genres = tv['genre']
genres = genres.explode()
genres = genres.drop_duplicates()
genres = genres.dropna()
genres = genres.reset_index(drop=True)
genreslst = genres


tv['votes'] = tv['votes'].str.replace(',', '')
tv['votes'] = tv['votes'].astype(int)

tv['text'] = tv['text'].fillna(tv['overview'])

tv['text'] = tv['text'].str.replace("'", "")




uri = "neo4j+s://27bf1959.databases.neo4j.io"
username = "neo4j"
password = "Fg8JCF_eCoebZ7c_ngZNavbSbC9uSWP5Ff63JKR-0ns"


driver = GraphDatabase.driver(uri, auth=(username, password))
graph = Graph(uri, auth=(username, password))

fake = fk.Faker()

lstCountry = [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
]
lstPlatform = ["Netflix", "Amazon Prime", "HBO Max", "Star+", "Disney+", "Apple TV", "Hulu", "Peacock", "Paramount+", "YouTube TV", "Rakkuten", "Crunchyroll" ]

lstRol = ["Extra", "Secundario", "Principal"]

lstMainEvent = ["vaqueros","samurais","vampiros","zombies","extraterrestres","robots","fantasmas","superheroes","villanos","mafiosos","terroristas","policías","bomberos","médicos","científicos","ingenieros","arquitectos","abogados","políticos","periodistas"]

lstpremios = ["Oscar", "Globo de Oro", "Emmy", "BAFTA", "Cannes", "Venecia", "Berlin", "Goya", "Ariel", "Fenix", "Platino", "Grammy", "Tony", "Pulitzer", "Nobel", "Cervantes", "Principe de Asturias", "Nacional de Literatura", "Nacional de Ciencias", "Nacional de Artes"]
lstTransmision = ["En vivo", "Grabado", "En diferido", "En diferido con retransmisión en vivo"]
lstRestriccionPorEdad = ["AA", "A", "B", "B15", "C", "D", "C18", "D18", "E", "E10", "E12", "E15", "E18", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
lstPlanes = ["Básico", "Estándar", "Premium"]

def runQuery(tx, query):
    result = tx.run(query)
    return result

def createUsers(tx):
    for i in range(1500):
        name = fake.name()
        name = name.replace("'", "")
        apellido = fake.last_name()
        apellido = apellido.replace("'", "")
        query = f"CREATE (u:Usuarios {{name: '{name}', apellido: '{apellido}', edad: {rm.randint(18, 60)}, email: '{fake.email()}', contraseña: '123456789' }})"
        tx.run(query)

def premiated():
    verificacion = rm.randint(0, 1)
    if verificacion == 1:
        return True
    else:
        return False

def createActor(tx, ):
    for i in range(903):
        name = fake.name()
        name = name.replace("'", "")
        
        query = f"CREATE (a:Actor {{name: '{name}', edad: {rm.randint(18, 60)}, Nacionalidad: '{lstCountry[rm.randint(0,18)]}', premiado: {premiated()} }})"
        tx.run(query)

def createGenre(tx):
    for genre in genres:
        query = f"CREATE (g:Genre {{name: '{genre}', description: '{fake.text()}' }})"
        tx.run(query)

def createDirector(tx):
    for i in range(403):
        name = fake.name()
        name = name.replace("'", "")
        query = f"CREATE (d:Director {{name: '{name}', edad: {rm.randint(18, 60)}, Nacionalidad: '{lstCountry[rm.randint(0,18)]}', premiado: {premiated()} }})"
        tx.run(query)

def createPlatform(tx):
    for platform in lstPlatform:
        query = f"CREATE (p:Platform {{name: '{platform}', tipo: 'Streaming', lanzamiento: '{fake.date()}', precio: {rm.randint(5, 20)} }})"
        tx.run(query)


def loadDFasCSVSeries(tx):
    for index, row in tv.iterrows():
        # Convert the first_air_date to a valid year format
        year = pd.to_datetime(row['first_air_date']).year
        
        query = f"CREATE (s:Series {{title: '{row['title']}', rating: {row['rating']}, ratingCount: {row['votes']}, descripcion: '{row['text']}', year: {year}, Duracion: '{row['runtime']}', Total_caps: {rm.randint(1, 1000)}}})"
        tx.run(query)
        
def randomPremios():
    premios = []
    for i in range(rm.randint(1, 5)):
        premios.append(lstpremios[rm.randint(0,18)])
    return premios

def crearRelacionesActores():
    actorsQuery = f"MATCH (a:Actor) RETURN a.name"
    seriesQuery = f"MATCH (s:Series) RETURN s.title"
    usuariosQuery = f"MATCH (u:Usuarios) RETURN u.name"

    actores = graph.run(actorsQuery).data()
    series = graph.run(seriesQuery).data()
    usuarios = graph.run(usuariosQuery).data()

    #for serie in series:
    #    for actor in actores:
    #        if rm.random() < 0.03:
    #            actor["a.name"] = actor["a.name"].replace("'", "")
    #            serie["s.title"] = serie["s.title"].replace("'", "")
    #            personaje = fake.name()
    #            personaje = personaje.replace("'", "")
    #            query = f"MATCH (a:Actor {{name: '{actor['a.name']}'}}), (s:Series {{title: '{serie['s.title']}'}}) CREATE (a)-[:Participa_en {{personaje: '{personaje}', date_part: '{fake.date()}',rol:'{lstRol[rm.randint(0,2)]}'}}]->(s)"
    #            graph.run(query)
    for usuario in usuarios:
        for actor in actores:
            if rm.random() < 0.007:
                actor["a.name"] = actor["a.name"].replace("'", "")
                usuario["u.name"] = usuario["u.name"].replace("'", "")
                query = f"MATCH (u:Usuarios {{name: '{usuario['u.name']}'}}), (a:Actor {{name: '{actor['a.name']}'}}) CREATE (a)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: '{fake.date()}'}}]->(u)"
                graph.run(query)

def crearRelacionesDirectores():
    directorsQuery = f"MATCH (d:Director) RETURN d.name"
    seriesQuery = f"MATCH (s:Series) RETURN s.title"
    usuariosQuery = f"MATCH (u:Usuarios) RETURN u.name"

    directors = graph.run(directorsQuery).data()
    series = graph.run(seriesQuery).data()
    usuarios = graph.run(usuariosQuery).data()

    #for serie in series:
    #    for director in directors:
    #        if rm.random() < 0.015:
    #            director["d.name"] = director["d.name"].replace("'", "")
    #            serie["s.title"] = serie["s.title"].replace("'", "")
    #            productor = fake.name()
    #            productor = productor.replace("'", "")
    #            query = f"MATCH (d:Director {{name: '{director['d.name']}'}}), (s:Series {{title: '{serie['s.title']}'}}) CREATE (d)-[:Dirige {{episodios: {rm.randint(1,15)}, fecha_direccion: '{fake.date()}', productor: '{productor}'}}]->(s)"
    #            graph.run(query)
    for usuario in usuarios:
        for director in directors:
            if rm.random() < 0.004:
                director["d.name"] = director["d.name"].replace("'", "")
                usuario["u.name"] = usuario["u.name"].replace("'", "")
                query = f"MATCH (u:Usuarios {{name: '{usuario['u.name']}'}}), (d:Director {{name: '{director['d.name']}'}}) CREATE (d)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: '{fake.date()}'}}]->(u)"
                graph.run(query)

def crearRelacionesGeneros():
    genresQuery = f"MATCH (g:Genre) RETURN g.name"
    seriesQuery = f"MATCH (s:Series) RETURN s.title"
    usuariosQuery = f"MATCH (u:Usuarios) RETURN u.name"
    plataformaQuery = f"MATCH (p:Platform) RETURN p.name"

    genres = graph.run(genresQuery).data()
    series = graph.run(seriesQuery).data()
    usuarios = graph.run(usuariosQuery).data()
    plataformas = graph.run(plataformaQuery).data()

    #for genre in genres:
    #    for serie in series:
    #        if rm.random() < 0.01:
    #            genre["g.name"] = genre["g.name"].replace("'", "")
    #            serie["s.title"] = serie["s.title"].replace("'", "")
    #            query = f"MATCH (g:Genre {{name: '{genre['g.name']}'}}), (s:Series {{title: '{serie['s.title']}'}}) CREATE (s)-[:Pertenece {{genero_secundario: '{genreslst[rm.randint(0,len(genres)-1)]}', tema_principal: '{lstMainEvent[rm.randint(0,len(lstMainEvent)-1)]}', premios:'{randomPremios()[0]}'}}]->(g)"
    #            graph.run(query)
    #for usuario in usuarios:
    #    for genre in genres:
    #        if rm.random() < 0.006:
    #            genre["g.name"] = genre["g.name"].replace("'", "")
    #            usuario["u.name"] = usuario["u.name"].replace("'", "")
    #            query = f"MATCH (u:Usuarios {{name: '{usuario['u.name']}'}}), (g:Genre {{name: '{genre['g.name']}'}}) CREATE (g)-[:fav_de {{subgenero: '{genreslst[rm.randint(0,18)]}', rating: {rm.randint(0,5)}, numSeriesVistas: {rm.randint(0,3)}}}]->(u)"
    #            graph.run(query)
    for plataforma in plataformas:
        for genre in genres:
            if rm.random() < 0.007:
                genre["g.name"] = genre["g.name"].replace("'", "")
                plataforma["p.name"] = plataforma["p.name"].replace("'", "")
                query = f"MATCH (p:Platform {{name: '{plataforma['p.name']}'}}), (g:Genre {{name: '{genre['g.name']}'}}) CREATE (p)-[:Cuenta_con {{numTitulos: {rm.randint(1,10)}, GeneroExclusivo: {premiated()}, PG: '{lstRestriccionPorEdad[rm.randint(0,len(lstRestriccionPorEdad)-1)]}'}}]->(g)"
                graph.run(query)

def crearRelacionesSeries():
    seriesQuery = f"MATCH (s:Series) RETURN s.title"
    usuariosQuery = f"MATCH (u:Usuarios) RETURN u.name"
    plataformaQuery = f"MATCH (p:Platform) RETURN p.name"

    series = graph.run(seriesQuery).data()
    usuarios = graph.run(usuariosQuery).data()
    plataformas = graph.run(plataformaQuery).data()

    #for usuario in usuarios:
    #    for serie in series:
    #        if rm.random() < 0.01:
    #            serie["s.title"] = serie["s.title"].replace("'", "")
    #            usuario["u.name"] = usuario["u.name"].replace("'", "")
    #            query = f"MATCH (u:Usuarios {{name: '{usuario['u.name']}'}}), (s:Series {{title: '{serie['s.title']}'}}) CREATE (s)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: {premiated()}}}]->(u)"
    #            graph.run(query)

    for plataforma in plataformas:
        for serie in series:
            if rm.random() < 0.005:
                serie["s.title"] = serie["s.title"].replace("'", "")
                plataforma["p.name"] = plataforma["p.name"].replace("'", "")
                query = f"MATCH (p:Platform {{name: '{plataforma['p.name']}'}}), (s:Series {{title: '{serie['s.title']}' }}) CREATE (s)-[:Transmite_en {{transmision: '{lstTransmision[rm.randint(0,len(lstTransmision)-1)]}', idioma: 'En', geolocalizacion: 'US', PG:'{lstRestriccionPorEdad[rm.randint(0,len(lstRestriccionPorEdad)-1)]}'}}]->(p)"
                graph.run(query)

def usuariosSuscritos():
    usuariosQuery = f"MATCH (u:Usuarios) RETURN u.name"
    plataformaQuery = f"MATCH (p:Platform) RETURN p.name"

    usuarios = graph.run(usuariosQuery).data()
    plataformas = graph.run(plataformaQuery).data()

    for usuario in usuarios:
        for plataforma in plataformas:
            if rm.random() < 0.01:
                usuario["u.name"] = usuario["u.name"].replace("'", "")
                plataforma["p.name"] = plataforma["p.name"].replace("'", "")
                query = f"MATCH (u:Usuarios {{name: '{usuario['u.name']}'}}), (p:Platform {{name: '{plataforma['p.name']}' }}) CREATE (u)-[:Suscrito_a {{fechaSuscripcion: '{fake.date()}', plan: '{lstPlanes[rm.randint(0,2)]}', Pago: 'Tarjeta', numDisp: {rm.randint(0,7)}}}]->(p)"
                graph.run(query)
    

def createRelationships(tx):
    #query = f"MATCH (a:Actor), (s:Series) WHERE rand() < 0.03 CREATE (a)-[:Participa_en {{personaje: '{fake.name()}', date_part: '{fake.date()}',rol:'{lstRol[rm.randint(0,2)]}'}}]->(s)"
    #tx.run(query)

    #query = f"MATCH (d:Director), (s:Series) WHERE rand() < 0.015 CREATE (d)-[:Dirige {{episodios: {rm.randint(1,15)}, fecha_direccion: '{fake.date()}', productor: '{fake.name()}'}}]->(s)"
    #tx.run(query)

    #query = f"MATCH (g:Genre), (s:Series) WHERE rand() < 0.03 CREATE (s)-[:Pertenece {{genero_secundario: '{genres[rm.randint(0,len(genres)-1)]}', tema_principal: '{lstMainEvent[rm.randint(0,len(lstMainEvent)-1)]}', premios:'{randomPremios()[0]}'}}]->(g)"
    #tx.run(query)

    query = f"MATCH (p:Platform), (s:Series) WHERE rand() < 0.01 CREATE (s)-[:Transmite {{transmision: '{lstTransmision[rm.randint(0,len(lstTransmision)-1)]}', idioma: 'En', geolocalizacion: 'US', PG:'{lstRestriccionPorEdad[rm.randint(0,len(lstRestriccionPorEdad)-1)]}'}}]->(p)"
    tx.run(query)

    #query = f"MATCH (u:User), (s:Series) WHERE rand() < 0.01 CREATE (s)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: {premiated()}}}]->(u)"
    #tx.run(query)

    #query = f"MATCH (u:User), (a:Actor) WHERE rand() < 0.007 CREATE (a)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: '{fake.date()}'}}]->(u)"
    #tx.run(query)

    #query = f"MATCH (u:User), (d:Director) WHERE rand() < 0.004 CREATE (d)-[:fav_de {{rating: {rm.randint(0,5)}, repeticiones: {rm.randint(0,3)}, estado: '{fake.date()}'}}]->(u)"
    #tx.run(query)

    #query = f"MATCH (u:User), (g:Genre) WHERE rand() < 0.006 CREATE (g)-[:fav_de {{subgenero: '{genres[rm.randint(0,18)]}', rating: {rm.randint(0,5)}, numSeriesVistas: {rm.randint(0,3)}}}]->(u)"
    #tx.run(query)

    #query = f"MATCH (u:User), (p:Platform) WHERE rand() < 0.01 CREATE (u)-[:Suscrito {{fechaSuscripcion: '{fake.date()}', plan: '{lstPlanes[rm.randint(0,2)]}', Pago: 'Tarjeta', numDisp: {rm.randint(0,7)}}}]->(p)"
    #tx.run(query)

    #query = f"MATCH (p:Plataforma), (g:Genres) WHERE rand() < 0.007 CREATE (p)-[:Cuenta_com {{numTitulos: {rm.randint(1,10)}, GeneroExclusivo: {premiated()}, PG: '{lstRestriccionPorEdad[rm.randint(0,len(lstRestriccionPorEdad)-1)]}'}}]->(g)"
    #tx.run(query)

def contar_favoritos_actor(tx):
    query = """
    MATCH (a:Actor)-[:fav_de]->(u:User)
    WITH a, count(u) as favoritos
    SET a.favoritos = favoritos
    """
    tx.run(query)

def contar_favoritos_director(tx):
    query = """
    MATCH (d:Director)-[:fav_de]->(u:User)
    WITH d, count(u) as favoritos
    SET d.favoritos = favoritos
    """
    tx.run(query)

def contar_favoritos_genero(tx):
    query = """
    MATCH (g:Genre)-[:fav_de]->(u:User)
    WITH g, count(u) as favoritos
    SET g.favoritos = favoritos
    """
    tx.run(query)

def contar_favoritos_serie(tx):
    query = """
    MATCH (s:Series)-[:fav_de]->(u:User)
    WITH s, count(u) as favoritos
    SET s.favoritos = favoritos
"""
    tx.run(query)

def contar_favoritos_plataforma(tx):
    query = """
    MATCH (p:Platform)-[:fav_de]->(u:User)
    WITH p, count(u) as favoritos
    SET p.favoritos = favoritos
"""
    tx.run(query)

def contar_numSeries_de_genero(tx):
    query = """
    MATCH (g:Genre)<-[:Pertenece]-(s:Series)
    WITH g, count(s) as numSeries
    SET g.numSeries = numSeries
"""
    tx.run(query)

def createGraph(tx):
    #createUsers(tx)
    #createActor(tx)
    #createDirector(tx)
    #createGenre(tx)
    #createPlatform(tx)
    #loadDFasCSVSeries(tx)
    #createRelationships(tx)
    contar_favoritos_actor(tx)
    contar_favoritos_director(tx)
    contar_favoritos_genero(tx)
    contar_favoritos_serie(tx)
    contar_favoritos_plataforma(tx)
    contar_numSeries_de_genero(tx)

def pushData():
    with driver.session() as session:
        session.write_transaction(createGraph)

    print("Data pushed to Neo4j")

    driver.close()

pushData()

#usuariosSuscritos()


