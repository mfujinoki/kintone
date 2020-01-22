/*
 * Discord bot sample program
 * Copyright (c) 2019 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    'use strict';
    const Discord = require('discord.js');
    const config = require('../config.json');
    const discordClient = new Discord.Client();

    const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

    let domainName = config.KINTONE_DOMAIN;
    let APIToken = config.KINTONE_API_TOKEN;
    let appID = config.KINTONE_APP_ID;

    const kintoneClient = new KintoneRestAPIClient({
        baseUrl: domainName,
        // Use API Token authentication
        auth: { apiToken: APIToken }
    });

    discordClient.once('ready', () => {
        console.log('Ready!');
    });

    discordClient.on('message', message => {
        if (message.attachments.size > 0) {
            message.attachments.forEach(function(attachment) {
                let file_name = attachment.filename.split('.');
                let file_type = file_name[file_name.length - 1];
                let recordData = {
                    file_link: {
                        value: attachment.url
                    },
                    file_name: {
                        value: attachment.filename
                    },
                    posted_by: {
                        value: message.author.username
                    },
                    posted_date: {
                        value: message.createdAt
                    },
                    file_type: {
                        value: file_type
                    }
                };
                kintoneClient.record
                    .addRecord({ app: appID, record: recordData})
                    .then(resp => {
                        console.log(resp);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
        }
    });

    discordClient.login(config.DISCORD_API_TOKEN);
})();
