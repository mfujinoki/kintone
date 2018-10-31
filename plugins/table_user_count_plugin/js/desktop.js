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
    var USERCOUNT1 = USERS[0].count; // field code of number field to count User 1
    var USERCOUNT2 = USERS[1].count; // field code of number field to count User 2
    var USERCOUNT3 = USERS[2].count; // field code of number field to count User 3
    var USER1 = USERS[0].login; // the log in name of User 1
    var USER2 = USERS[1].login; // the log in name of User 2
    var USER3 = USERS[2].login; // the log in name of User 3


    //Set events to run when the save button is clicked on the record create or edit page
    kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], function(eventobj) {
        //Count the number of rows in the table
        var num_of_rows = eventobj.record[TABLEDATA].value;
        var user1_count = 0;
        var user2_count = 0;
        var user3_count = 0;

        for (var i = 0; num_of_rows.length > i; i++) {
            var num_of_users = num_of_rows[i].value[USERFIELD].value;
            for (var cnt = 0; num_of_users.length > cnt; cnt++) {
                var user = num_of_users[cnt].code;
                if (user === USER1) {
                    user1_count++;
                } else if (user === USER2) {
                    user2_count++;
                } else if (user === USER3) {
                    user3_count++;
                }
            }
        }

        //Set a new value in a field, listed in the event object
        eventobj.record[USERCOUNT1].value = user1_count;
        eventobj.record[USERCOUNT2].value = user2_count;
        eventobj.record[USERCOUNT3].value = user3_count;

        //Return the event object, so that kintone will use this new data
        return eventobj;
    });
})(kintone.$PLUGIN_ID);
