/*
 * This sample plugin counts the number of users listed inside the tables,
 * and places that number in a given field, when you save your record data.
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

    var TABLEDATA = CONFIG.table_field; // field code of the table
    var USERFIELD = CONFIG.user_field; // field code of user field in table
    var USERS = JSON.parse(CONFIG.user_count);

    //Set events to run when the save button is clicked on the record create or edit page
    kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], function(eventobj) {
        //Count the number of rows in the table
        var num_of_rows = eventobj.record[TABLEDATA].value;
        var user_count = [];
        for (var j = 0; j < USERS.length; j++) {
            user_count[j] = 0;
        }

        for (var i = 0; num_of_rows.length > i; i++) {
            var num_of_users = num_of_rows[i].value[USERFIELD].value;
            for (var cnt = 0; num_of_users.length > cnt; cnt++) {
                var user = num_of_users[cnt].code;
                for (var k = 0; k < USERS.length; k++) {
                    if (user === USERS[k][0]) {
                        user_count[k]++;
                    }
                }
            }
        }

        //Set a new value in a field, listed in the event object
        for (var l = 0; l < USERS.length; l++) {
            eventobj.record[USERS[l][1]].value = user_count[l];
        }

        //Return the event object, so that kintone will use this new data
        return eventobj;
    });
})(kintone.$PLUGIN_ID);
