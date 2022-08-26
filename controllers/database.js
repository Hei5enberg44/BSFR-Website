const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config.json')

const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mariadb',
    logging: false
})

const Cities = sequelize.define('cities', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    code_postal: DataTypes.INTEGER,
    nom_de_la_commune: DataTypes.STRING(255),
    coordonnees_gps: DataTypes.STRING(255)
}, {
    timestamps: false,
    freezeTableName: true
})

const MPOV = sequelize.define('multi_pov', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    map_id: DataTypes.STRING(255),
    difficulty: DataTypes.STRING(255),
    date_start: { type: 'TIMESTAMP' },
    date_end: { type: 'TIMESTAMP' }
}, {
    timestamps: false,
    freezeTableName: true
})

module.exports = {
    Cities, MPOV
}