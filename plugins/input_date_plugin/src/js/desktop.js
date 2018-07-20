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

    var CONFIG_DATE = CONFIG.date;
    var CONFIG_SPACE = CONFIG.space;

    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {
        var btn = document.createElement('button');
        btn.textContent = "Input Today's Date";
        kintone.app.record.getSpaceElement(CONFIG_SPACE).appendChild(btn);
 
        btn.onclick = function() {
            var date = new Date();
            var today = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
 
            var rec = kintone.app.record.get();
            rec.record[CONFIG_DATE].value = today;
            kintone.app.record.set(rec);
        };
        return event;
    });
 
})(kintone.$PLUGIN_ID);
