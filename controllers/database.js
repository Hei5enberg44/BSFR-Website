import { Sequelize, DataTypes } from 'sequelize'
import config from '../config.json' assert { type: 'json' }

const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mariadb',
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    }
})

const Birthdays = sequelize.define('birthdays', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATEONLY()
})

const Mutes = sequelize.define('mutes', {
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

const Bans = sequelize.define('bans', {
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

const BirthdayMessages = sequelize.define('birthday_messages', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    message: DataTypes.TEXT(),
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE()
})

const MaliciousURL = sequelize.define('malicious_url', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    url: DataTypes.TEXT(),
    memberId: DataTypes.STRING(255),
    date: DataTypes.DATE()
})

const Twitch = sequelize.define('twitch', {
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

const Cities = sequelize.define('cities', {
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

const MPOV = sequelize.define('multi_pov', {
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

const YoutubeVideos = sequelize.define('youtube_videos', {
    id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true
    },
    videoId: DataTypes.STRING(255),
    publishedAt: DataTypes.DATE(),
    title: DataTypes.STRING(255)
})

export {
    Birthdays, Mutes, Bans, BirthdayMessages, MaliciousURL, Twitch, Cities, MPOV, YoutubeVideos
}