/*
MIT License
Copyright (c) 2018 Cybozu
https://github.com/kintone/SAMPLE-Date-input-button-Plug-in/blob/master/LICENSE
*/

/*
A button will be placed on the Blank Space field
Click the button to add today's date into the date field
*/

(function(PLUGIN_ID) {
    'use strict';

    // Get plugin configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!CONFIG) {
        return false;
    }
    // Get each settings
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
