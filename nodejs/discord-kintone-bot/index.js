(function() {
    'use strict';
    const Discord = require('discord.js');
    const config = require('../config.json');
    const client = new Discord.Client();

    const kintone = require('kintone-nodejs-sdk');
    let APIToken = config.KINTONE_API_TOKEN;
    let kintoneAuth = new kintone.Auth();
    kintoneAuth.setApiToken(APIToken);

    let domainName = config.KINTONE_DOMAIN;
    let kintoneConnection = new kintone.Connection(domainName, kintoneAuth);

    let kintoneRecord = new kintone.Record(kintoneConnection);
    let appID = config.KINTONE_APP_ID;


    client.once('ready', () => {
	    console.log('Ready!');
    });

    client.on('message', message => {
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

                kintoneRecord.addRecord(appID, recordData)
                    .then((resp) => {
                        console.log(resp);
                    })
                    .catch((err => {
                        console.log(err.get());
                    }));
            });
        }
    });

    client.login(config.DISCORD_API_TOKEN);
})();
