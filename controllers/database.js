const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config.json')

const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mariadb',
    logging: false
})

const Birthdays = sequelize.define('birthdays', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATEONLY
}, {
    timestamps: false,
    freezeTableName: true
})

const Mutes = sequelize.define('mutes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    mutedBy: DataTypes.STRING(255),
    reason: DataTypes.TEXT,
    muteDate: DataTypes.DATE,
    unmuteDate: DataTypes.DATE
}, {
    timestamps: false,
    freezeTableName: true
})

const Bans = sequelize.define('bans', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    bannedBy: DataTypes.STRING(255),
    approvedBy: DataTypes.STRING(255),
    reason: DataTypes.TEXT,
    banDate: DataTypes.DATE,
    unbanDate: DataTypes.DATE
}, {
    timestamps: false,
    freezeTableName: true
})

const BirthdayMessages = sequelize.define('birthday_messages', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: DataTypes.TEXT,
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE
}, {
    timestamps: false,
    freezeTableName: true
})

const MaliciousURL = sequelize.define('malicious_url', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    url: DataTypes.TEXT,
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE
}, {
    timestamps: false,
    freezeTableName: true
})

const Twitch = sequelize.define('twitch', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    channelName: DataTypes.STRING(255),
    live: DataTypes.BOOLEAN,
    messageId: DataTypes.STRING(255)
}, {
    timestamps: false,
    freezeTableName: true
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
    date_start: DataTypes.DATE,
    date_end: DataTypes.DATE
}, {
    timestamps: false,
    freezeTableName: true
})

module.exports = {
    Birthdays, Mutes, Bans, BirthdayMessages, MaliciousURL, Twitch, Cities, MPOV
}