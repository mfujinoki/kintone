/*
 * This sample code logs users who have viewed the record.
 * The name of the user who viewed the record is automatically placed in the User selection field.
 * Copyright (c) 2018 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';

    // Get plugin configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    // Get each settings
    if (!CONFIG) {
        return false;
    }

    var VIEWEDUSERS = CONFIG.user_log; //field code of user selection field
    var events = ['app.record.detail.show'];

    kintone.events.on(events, function(event) {
        var record = event.record;
        var isRead = false;
        var users = record[VIEWEDUSERS].value;
        var myUserCode = kintone.getLoginUser().code;

        for (var i in users) {
            if (!users.hasOwnProperty(i)) { continue; }
            if (users[i].code === myUserCode) {
                isRead = true;
            }
        }

        if (isRead) { return event; }

        var param = {
            "app": kintone.app.getId(),
            "id": kintone.app.record.getId(),
            "record": {
                [VIEWEDUSERS]: {
                    "value": users.concat({
                        "code": myUserCode
                    })
                }
            }
        };
        kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', param).then(function(resp) {
            location.reload();
        }).catch(function(error) {
            alert(error.message);
        });
    });
})(kintone.$PLUGIN_ID);
