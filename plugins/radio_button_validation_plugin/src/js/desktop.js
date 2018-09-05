/*
 * This sample code shows how to display error messages on kintone records.
 * In this particular example, the user must choose a value for the radio button field other than the default value
 * - otherwise an error will show up on the field and the record.
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

    var RADIOBUTTON = CONFIG.radio_button;
    var RADIO_VALUE = CONFIG.default_value;

    // Run code when saving a record
    var ev = ['app.record.create.submit', 'app.record.index.edit.submit', 'app.record.edit.submit'];
    kintone.events.on(ev, function(event) {

        // Get record data
        var record = event.record;
        var selection = record[RADIOBUTTON].value;
        var params = {
            app: kintone.app.getId()
        };
        return kintone.api('/k/v1/app/form/fields', 'GET', params).then(function(resp) {
            // Obtain label name of Radio button field
            var name = resp.properties[RADIOBUTTON].label;
            if (selection === RADIO_VALUE) {
                var errMessage = "Please select other than \"" + selection + "\"";
                // Show message underneath field
                record[RADIOBUTTON].error = errMessage;
                // Show message at top of record
                event.error = errMessage + " for the field \"" + name + "\"";
            }
            return event;
        });
    });
})(kintone.$PLUGIN_ID);
