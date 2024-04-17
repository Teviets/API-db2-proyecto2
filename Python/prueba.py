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


tv['votes'] = tv['votes'].str.replace(',', '')
tv['votes'] = tv['votes'].astype(int)

# si en text hay un valor nan obtener el valor de overview
tv['text'] = tv['text'].fillna(tv['overview'])

print(tv.columns)
print(tv['text'])