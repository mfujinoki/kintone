/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';

    // Input Mode
    var MODE_ON = '1'; // Input Check after change

    // Get plugin configuration settings
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
    // Get each settings
    if (!CONFIG) {
        return false;
    }

    var CONFIG_ZIP = CONFIG.zip;
    var CONFIG_TEL = CONFIG.tel;
    var CONFIG_FAX = CONFIG.fax;
    var CONFIG_MAIL = CONFIG.mail;

    // Input check mode on change: 1, Non-check mode: 0
    var MODE_CONFIG = CONFIG.mode;

    // Postal Code check
    function zipCheck(event) {
        // Define Postal Code (7 digit alphanumeric value)
        var zip_pattern = /^\d{7}$/;
        // Retrieve records from event variable
        var rec = event.record;
        // Initilize error
        rec.CONFIG_ZIP.error = null;
        // Validate Postal Code if exists
        var zip_value = rec.CONFIG_ZIP.value;
        if (zip_value) {
            if (zip_value.length > 0) {
                // Verify if input matches defined pattern
                if (!(zip_value.match(zip_pattern))) {
                    // Display errror if unmatched
                    rec.CONFIG_ZIP.error = 'Please enter 7 digit alphanumeric value';
                }
            }
        }
    }

    // Phone # check
    function telCheck(event) {
        // Define Phone #(10 or 11 digit numeric value)
        var tel_pattern = /^\d{10,11}$/;
        // Retrieve records from event object
        var rec = event.record;
        // Initialize error
        rec.CONFIG_TEL.error = null;

        // Input check if exists
        var tel_value = rec.CONFIG_TEL.value;
        if (tel_value) {
            if (tel_value.length > 0) {
                // Verify if pattern matches
                if (!(tel_value.match(tel_pattern))) {
                    // Display error if unmatched
                    rec.CONFIG_TEL.error = 'Please enter 10 or 11 digit numeric value';
                }
            }
        }
    }

    // FAX # input check
    function faxCheck(event) {
        // Define Fax #(10 or 11 digit numerice value)
        var fax_pattern = /^\d{10,11}$/;
        // Retrieve records from event object
        var rec = event.record;
        // Initialize error
        rec.CONFIG_FAX.error = null;
        // Validate input if exists
        var fax_value = rec.CONFIG_FAX.value;
        if (fax_value) {
            if (fax_value.length > 0) {
                // Verify if pattern matches
                if (!(fax_value.match(fax_pattern))) {
                    // Display error if unmatched
                    rec[CONFIG_FAX].error = 'Please enter 10 or 11 digit numerice value';
                }
            }
        }
    }

    // Email input check
    function mailCheck(event) {
        // Define Email address pattern
        var mail_pattern = /^([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+$/;
        // Retrieve records from event object
        var rec = event.record;
        // Initialize error
        rec.CONFIG_MAIL.error = null;
        // Validate if exists
        var mail_value = rec.CONFIG_MAIL.value;
        if (mail_value) {
            if (mail_value.length > 0) {
                // Verify if matches
                if (!(mail_value.match(mail_pattern))) {
                    // Display error if unmatched
                    rec[CONFIG_MAIL].error = 'Email address is invalid. Please verify Email address';
                }
            }
        }
    }

    // Create, Edit event(New record, edit record, and edit record in list)
    kintone.events.on(['app.record.create.submit',
        'app.record.edit.submit',
        'app.record.index.edit.submit'], function(event) {
        zipCheck(event);
        telCheck(event);
        faxCheck(event);
        mailCheck(event);
        return event;
    });

    // Change event(Postal Code)
    kintone.events.on(['app.record.create.change.' + CONFIG_ZIP,
        'app.record.edit.change.' + CONFIG_ZIP,
        'app.record.index.edit.change.' + CONFIG_ZIP
    ], function(event) {
        if (MODE_CONFIG === MODE_ON) {
            zipCheck(event);
        }
        return event;
    });

    // Change event(Phone #)
    kintone.events.on(['app.record.create.change.' + CONFIG_TEL,
        'app.record.edit.change.' + CONFIG_TEL,
        'app.record.index.edit.change.' + CONFIG_TEL
    ], function(event) {
        if (MODE_CONFIG === MODE_ON) {
            telCheck(event);
        }
        return event;
    });

    // Change event(FAX)
    kintone.events.on(['app.record.create.change.' + CONFIG_FAX,
        'app.record.edit.change.' + CONFIG_FAX,
        'app.record.index.edit.change.' + CONFIG_FAX
    ], function(event) {
        if (MODE_CONFIG === MODE_ON) {
            faxCheck(event);
        }
        return event;
    });

    // Change event(Email)
    kintone.events.on(['app.record.create.change.' + CONFIG_MAIL,
        'app.record.edit.change.' + CONFIG_MAIL,
        'app.record.index.edit.change.' + CONFIG_MAIL
    ], function(event) {
        if (MODE_CONFIG === MODE_ON) {
            mailCheck(event);
        }
        return event;
    });
})(kintone.$PLUGIN_ID);
