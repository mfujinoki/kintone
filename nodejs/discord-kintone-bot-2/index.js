/*
 * Discord bot sample program
 * Copyright (c) 2020 Cybozu
 *
 * Licensed under the MIT License
*/
const Discord = require('discord.js');
const config = require('../config.json');
const discordClient = new Discord.Client();
const command = '!find-file';
const arg1 = 'type';
const arg2 = 'category';

const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

const domainName = config.KINTONE_DOMAIN;
const APIToken = config.KINTONE_API_TOKEN;
const appID = config.KINTONE_APP_ID;
const discordToken = config.DISCORD_API_TOKEN;

const kintoneClient = new KintoneRestAPIClient({
    baseUrl: domainName,
    // Use API Token authentication
    auth: { apiToken: APIToken }
});

discordClient.once('ready', () => {
    console.log('Ready!');
});

discordClient.on('message', message => {
    if (!message.content.startsWith(command)) {
        return;
    }
    const args = message.content.slice(command.length + 1).split(' ');

    if (args.length < 2) {
        return message.channel.send(`ファイルタイプ、または、カテゴリーが指定されていません、 ${message.author}!`);
    }
    let fileType = '';
    let category = '';
    args.forEach(arg => {
        if (arg.startsWith(arg1)) {
            fileType = arg.slice(arg1.length + 1).split(':');
        } else if (arg.startsWith(arg2)) {
            category = arg.slice(arg2.length + 1).split(':');
        }
    });

    const query = 'file_type in ("' + fileType + '") and category in ("' + category + '")';

    kintoneClient.record.getRecords({ app: appID, query: query})
        .then(resp => {
            message.channel.send(`${message.author} ${resp.records.length} file(s) found!`);
            resp.records.forEach(element => {
                message.channel.send(`${element.file_name.value} created at ${element.作成日時.value} ${element.file_link.value}`);
            });
        })
        .catch(err => {
            console.log(err);
        });
});

discordClient.login(discordToken);
