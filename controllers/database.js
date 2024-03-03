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

const Users = sequelizeWebsite.define('users', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING(255),
        unique: true
    },
    token: DataTypes.TEXT()
})

const Runs = sequelizeWebsite.define('runs', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    url: DataTypes.TEXT(),
    description: DataTypes.TEXT(),
    map: DataTypes.STRING(255),
    headset: DataTypes.STRING(255),
    grip: DataTypes.STRING(255),
    comment: DataTypes.TEXT(),
    date: DataTypes.DATE(),
    status: DataTypes.INTEGER()
})

const sequelizeRankedle = new Sequelize(config.databases.rankedle.name, config.databases.rankedle.username, config.databases.rankedle.password, {
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

const Rankedles = sequelizeRankedle.define('rankedles', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    seasonId: DataTypes.INTEGER(),
    mapId: DataTypes.STRING(255),
    date: DataTypes.DATEONLY()
})

const RankedleSeasons = sequelizeRankedle.define('rankedle_seasons', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    dateStart: DataTypes.DATE(),
    dateEnd: DataTypes.DATE()
})

const RankedleMaps = sequelizeRankedle.define('rankedle_maps', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    map: DataTypes.JSON()
})

const RankedleScores = sequelizeRankedle.define('rankedle_scores', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    rankedleId: DataTypes.INTEGER(),
    memberId: DataTypes.STRING(255),
    dateStart: DataTypes.DATE(),
    dateEnd: DataTypes.DATE(),
    skips: DataTypes.INTEGER(),
    details: DataTypes.JSON(),
    hint: DataTypes.BOOLEAN(),
    success: DataTypes.BOOLEAN(),
    messageId: DataTypes.INTEGER()
})

const RankedleStats = sequelizeRankedle.define('rankedle_stats', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    seasonId: DataTypes.INTEGER(),
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
    maxStreak: DataTypes.INTEGER(),
    points: DataTypes.FLOAT()
})

const RankedleMessages = sequelizeRankedle.define('rankedle_messages', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    type: DataTypes.STRING(255),
    content: DataTypes.TEXT(),
    image: DataTypes.BLOB()
})

RankedleMaps.hasOne(Rankedles, {
    sourceKey: 'id',
    foreignKey: 'mapId'
})

RankedleScores.hasOne(Rankedles, {
    sourceKey: 'rankedleId',
    foreignKey: 'id',
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

const FranceCities = sequelizeAgent.define('france_cities', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    nom_de_la_commune: DataTypes.STRING(255),
    code_postal: DataTypes.INTEGER(),
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

const Roles = sequelizeAgent.define('roles', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    categoryId: DataTypes.INTEGER(),
    name: DataTypes.STRING(255),
    multiple: DataTypes.BOOLEAN()
})

const RolesCategories = sequelizeAgent.define('roles_categories', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.STRING(255)
})

Roles.hasOne(RolesCategories, {
    sourceKey: 'categoryId',
    foreignKey: 'id'
})

const Settings = sequelizeAgent.define('settings', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.STRING(255),
    data: DataTypes.JSON()
})

const sequelizeCubeStalker = new Sequelize(config.databases.cubestalker.name, config.databases.cubestalker.username, config.databases.cubestalker.password, {
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

const Cards = sequelizeCubeStalker.define('cards', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    image: DataTypes.BLOB(),
    status: DataTypes.INTEGER()
})

export {
    Users, Runs, Rankedles, RankedleSeasons, RankedleMaps, RankedleScores, RankedleStats, RankedleMessages,
    Birthdays, Mutes, Bans, BirthdayMessages, MaliciousURL, Twitch, FranceCities, Cities, MPOV, YoutubeVideos, Feur, Roles, RolesCategories, Settings,
    Cards
}