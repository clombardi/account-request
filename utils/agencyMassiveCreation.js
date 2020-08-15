const _ = require("lodash");
const Mongo = require('mongodb');


const cities = [ 
    "Venado Tuerto", "Ceres", "Amstrong", "Arequito", "Pavón", "Leones", "Bell Ville", "Villa María", "Reconquista", "Rafaela",
    "Casilda", "San Lorenzo", "San Francisco", "Rufino", "Laboulaye", "Alcorta", "Firmat", "Villa Cañás", "La Carlota", "Monte Maíz",
    "Canals", "Adelia María", "Las Parejas", "Aarón Castellanos", "Diego de Alvear", "Chapuy", "Teodelina", "Hughes", "Rio Bamba",
    "Roldán", "Cañada de Gómez", "Cruz Alta"
]

const streets = [
    "Av. San Martín", "San Martín", "Belgrano", "25 de Mayo", "Moreno", "Balcarce", "Eva Perón", "Reconquista", "Defensa",
    "Hipólito Yrigoyen", "Provincias Unidas", "Ramón Carrillo", "Tosco", "Grito de Alcorta", "Dr. López", "Juanita Larrauri",
    "Cecilia Grierson", "Juana Azurduy", "Arbolito", "Las Tropas", "Av. Italia", "Güemes", "Vieytes",
    "Las Heras", "Brown", "Monteagudo", "Chacabuco", "San Lorenzo", "Maestro García", "Entre Ríos"
]


function dbCode(code) { return String(code).padStart(4, '0') }

function randomAgency(code, cityLimit, streetLimit) {
    const city = cities[_.random(0, cityLimit)]
    const street = streets[_.random(0, streetLimit)]
    const streetNumber = _.random(1, 999)
    const area = _.random(100, 2500)
    return {
        code: dbCode(code),
        name: city + " - " + String(code),
        address: street + " " + String(streetNumber),
        area
    }
}

function agencyData(firstCode) {
    const cityLimit = cities.length - 1;
    const streetLimit = streets.length - 1;
    return _.range(400000).map(n => randomAgency(firstCode + n, cityLimit, streetLimit))
}


async function insertManyAgencies() {
    const dbServerUrl = 'mongodb://localhost:27017/';
    const dbName = "accountRequestJs"

    const conn = await Mongo.MongoClient.connect(dbServerUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = conn.db(dbName)

    const agencies = db.collection("manyagencies");
    await agencies.insertMany(agencyData(8003001))

    await conn.close()
}

insertManyAgencies()





