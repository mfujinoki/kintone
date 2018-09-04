/*
 * This sample zero-fills a number, and sets it into another number field.
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

    var NUMBER = CONFIG.number; //field code of number field
    var ZEROFILL = CONFIG.zeropad; //field code of text field to set result into

    function zeroFill(value, length) {
        if (value.length >= length) { return value; }
        return (new Array(length).join('0') + value).slice(-length);
    }

    var events = ["app.record.create.change." + NUMBER, 'app.record.edit.change.' + NUMBER];

    kintone.events.on(events, function(event) {
        var record = event.record;
        var changes = event.changes.field;
        var length = 8; //number of digits for the zero-filled number
        record[ZEROFILL].value = zeroFill(changes.value, length);
        return event;
    });
})(kintone.$PLUGIN_ID);
