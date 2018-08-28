/*
 * This sample code counts the number of rows you have in your table,
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

    var TABLEROWS = CONFIG.table_row; //field code of the table
    var ROWCOUNT = CONFIG.row_count; //field code of the number field

    //The event triggers when the save button is clicked on the record create or edit page
    kintone.events.on(["app.record.create.submit", "app.record.edit.submit"], function(eventobj) {
        //Count the number of rows in the table
        var num_of_rows = eventobj.record[TABLEROWS].value.length;

        //Set a new value in a field, listed in the event object
        eventobj.record[ROWCOUNT].value = num_of_rows;

        //Return the event object, so that kintone will use this new data
        return eventobj;
    });
})(kintone.$PLUGIN_ID);
