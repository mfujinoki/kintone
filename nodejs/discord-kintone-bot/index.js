(function() {
    'use strict';
    const Discord = require('discord.js');
    const client = new Discord.Client();

    const kintone = require('kintone-nodejs-sdk');
    let APIToken = 'BiMy0eFANwIHwenzLgL7pZPk4QnZxSLSHBo2XdME';
    let kintoneAuth = new kintone.Auth();
    kintoneAuth.setApiToken(APIToken);

    let domainName = 'devxorudc.cybozu.com';
    let kintoneConnection = new kintone.Connection(domainName, kintoneAuth);

    let kintoneRecord = new kintone.Record(kintoneConnection);
    let appID = 126;


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

    client.login('NjAxODI3NTgyNDI1Njk0MjE4.Xa9Nlw.jVW7iZ78wTBHtxgF9kANEEHJacQ');
})();
