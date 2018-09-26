/*
 * This sample plugin allows only one user to be selected in the User selection field.
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

    var user_selection = CONFIG.user_selection; //Set the field code of the User Selection field
    var error_message = CONFIG.error_message;

    var myEvent = ['app.record.create.submit', 'app.record.edit.submit', 'app.record.index.edit.submit'];
    kintone.events.on(myEvent, function(event) {
        // Get the User Selection field information
        var record = event.record;
        var selectedUsers = record[user_selection].value;
        if (selectedUsers.length > 1) {
            // If more than one person is specified, set message to error property
            event.error = error_message;
        }
        return event;
    });
})(kintone.$PLUGIN_ID);
