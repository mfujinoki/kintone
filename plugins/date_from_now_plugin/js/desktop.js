/*
 * This sample plugin converts the date into a new format in the selected locale.
 * The new format is placed in the Record List instead of the original date format.
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
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    moment.locale(CONFIG.locale);	//initialize the locale
    var datetimefield = CONFIG.datetime_field;	//field code of a datetime field

    // Set the Record List Event
    kintone.events.on('app.record.index.show', function(e) {
        // Get the datetime fields in the record list
        var elements = kintone.app.getFieldElements(datetimefield);

        // Display text formatted by Moment.js instead of the initial dates
        for (var i = 0; i < e.records.length; i++) {
            var date = e.records[i][datetimefield].value;
            elements[i].style.verticalAlign = 'middle';
            elements[i].style.padding = '10px';
            elements[i].innerText = capitalizeFirstLetter(moment(date).fromNow());
        }
    });
})(kintone.$PLUGIN_ID);
