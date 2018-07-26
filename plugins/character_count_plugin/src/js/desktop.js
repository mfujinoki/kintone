/*
 * A button will be placed on the Blank Space field
 * Click the button to add today's date into the date field
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

    var CONFIG_BODY = CONFIG.body;
    var CONFIG_COUNT = CONFIG.count;

    kintone.events.on(['app.record.create.submit','app.record.edit.submit','app.record.index.edit.submit'], function (event) {


        // Obtain characters in the text field
        var rec = event.record;
        var st = rec[CONFIG_BODY].value;

        //Remove spaces
        var st2 = st.replace(/\s+/g, "");

        //Enter character count into number field
        rec[CONFIG_COUNT].value = st2.length;

        return event;
    });
 
})(kintone.$PLUGIN_ID);
