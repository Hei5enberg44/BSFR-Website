import { Sequelize, DataTypes } from 'sequelize'
import config from '../config.json' assert { type: 'json' }

const sequelizeWebsite = new Sequelize(config.databases.website.name, config.databases.website.username, config.databases.website.password, {
    host: config.databases.website.host,
    port: config.databases.website.port,
    dialect: 'mariadb',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    },
    timezone: 'Europe/Paris'
})

const Rankedles = sequelizeWebsite.define('rankedles', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    mapId: DataTypes.STRING(255),
    date: DataTypes.DATEONLY()
})

const RankedleMaps = sequelizeWebsite.define('rankedle_maps', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    map: DataTypes.JSON()
})

const RankedleScores = sequelizeWebsite.define('rankedle_scores', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    rankedleId: DataTypes.INTEGER(),
    memberId: DataTypes.STRING(255),
    skips: DataTypes.INTEGER(),
    details: DataTypes.JSON(),
    success: DataTypes.BOOLEAN(),
    resultMessage: DataTypes.STRING(255)
})

const RankedleStats = sequelizeWebsite.define('rankedle_stats', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    try1: DataTypes.INTEGER(),
    try2: DataTypes.INTEGER(),
    try3: DataTypes.INTEGER(),
    try4: DataTypes.INTEGER(),
    try5: DataTypes.INTEGER(),
    try6: DataTypes.INTEGER(),
    played: DataTypes.INTEGER(),
    won: DataTypes.INTEGER(),
    currentStreak: DataTypes.INTEGER(),
    maxStreak: DataTypes.INTEGER()
})

RankedleMaps.hasOne(Rankedles, {
    sourceKey: 'id',
    foreignKey: 'mapId',
    targetKey: 'mapId'
})

const sequelizeAgent = new Sequelize(config.databases.agent.name, config.databases.agent.username, config.databases.agent.password, {
    host: config.databases.agent.host,
    port: config.databases.agent.port,
    dialect: 'mariadb',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    },
    timezone: 'Europe/Paris'
})

const Birthdays = sequelizeAgent.define('birthdays', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATEONLY()
})

const Mutes = sequelizeAgent.define('mutes', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    mutedBy: DataTypes.STRING(255),
    reason: DataTypes.TEXT(),
    muteDate: DataTypes.DATE(),
    unmuteDate: DataTypes.DATE()
})

const Bans = sequelizeAgent.define('bans', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    bannedBy: DataTypes.STRING(255),
    approvedBy: DataTypes.STRING(255),
    reason: DataTypes.TEXT(),
    banDate: DataTypes.DATE(),
    unbanDate: DataTypes.DATE()
})

const BirthdayMessages = sequelizeAgent.define('birthday_messages', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    message: DataTypes.TEXT(),
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE()
})

const MaliciousURL = sequelizeAgent.define('malicious_url', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    url: DataTypes.TEXT(),
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE()
})

const Twitch = sequelizeAgent.define('twitch', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    channelName: DataTypes.STRING(255),
    live: DataTypes.BOOLEAN(),
    messageId: DataTypes.STRING(255)
})

const Cities = sequelizeAgent.define('cities', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    code_postal: DataTypes.INTEGER(),
    nom_de_la_commune: DataTypes.STRING(255),
    coordonnees_gps: DataTypes.STRING(255)
})

const MPOV = sequelizeAgent.define('multi_pov', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    map_id: DataTypes.STRING(255),
    difficulty: DataTypes.STRING(255),
    date_start: DataTypes.DATE(),
    date_end: DataTypes.DATE()
})

const YoutubeVideos = sequelizeAgent.define('youtube_videos', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    videoId: DataTypes.STRING(255),
    publishedAt: DataTypes.DATE(),
    title: DataTypes.STRING(255)
})

const Feur = sequelizeAgent.define('feur', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    attackerId: DataTypes.STRING(255),
    victimId: DataTypes.STRING(255),
    messageId: DataTypes.STRING(255),
    message: DataTypes.TEXT(),
    messageDate: DataTypes.DATE(),
    responseId: DataTypes.STRING(255),
    response: DataTypes.TEXT(),
    responseDate: DataTypes.DATE()
})

export {
    Rankedles, RankedleMaps, RankedleScores, RankedleStats,
    Birthdays, Mutes, Bans, BirthdayMessages, MaliciousURL, Twitch, Cities, MPOV, YoutubeVideos, Feur
}