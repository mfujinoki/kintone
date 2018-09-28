/*
 * This sample code displays the day of the week next to the Date field.
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

    var DATE = CONFIG.date_field; // field code of date field

    kintone.events.on(['app.record.detail.show'], function(event) {
        var record = event.record;

        var weekchars = JSON.parse(CONFIG.name_of_days);
        var date = new Date(record[DATE].value);
        var day = weekchars[date.getUTCDay()];

        var dayEl = document.createElement('span');
        dayEl.textContent = ' (' + day + ')';

        var dateEl = kintone.app.record.getFieldElement(DATE);
        dateEl.appendChild(dayEl);

        return event;
    });
})(kintone.$PLUGIN_ID);
