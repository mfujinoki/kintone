(function () {
    "use strict";
 
    var RADIOBUTTON = "allergies";
    var MULTICHOICE = "cause";
    var TEXTFIELD = "other";
    var RADIO_VALUE = "Yes";
    var MULTI_VALUE = "Other";
 
    //Events for detail, create and edit pages
    var events = ['app.record.detail.show',
                  'app.record.create.show',
                  'app.record.create.change.' + RADIOBUTTON,
                  'app.record.create.change.' + MULTICHOICE,
                  'app.record.create.change.' + TEXTFIELD,
                  'app.record.edit.show',
                  'app.record.edit.change.' + RADIOBUTTON,
                  'app.record.edit.change.' + MULTICHOICE,
                  'app.record.edit.change.' + TEXTFIELD];
 
    kintone.events.on(events, function(event) {
 
        var record = event.record;
 
        //Hide/unhide fields depending on field choices
        if (record[RADIOBUTTON]['value'] === RADIO_VALUE) {
            kintone.app.record.setFieldShown(MULTICHOICE, true);
 
            //If "Other" is not selected for the allergy cause, don't show a text field
            var fieldValue = record[MULTICHOICE]['value'];
            if (fieldValue.length === 0) {
                kintone.app.record.setFieldShown(TEXTFIELD, false);
            }
 
            //If "Other" is selected for the allergy cause, show a text field
            for (var i = 0; i < fieldValue.length; i++) {
                if (fieldValue[i] === MULTI_VALUE) {
                    kintone.app.record.setFieldShown(TEXTFIELD, true);
                }else {
                    kintone.app.record.setFieldShown(TEXTFIELD, false);
                }
            }
        }else {
            // If "No" is slected for "Do you have any food or drug allergies?", hide other fields
            kintone.app.record.setFieldShown(MULTICHOICE, false);
            kintone.app.record.setFieldShown(TEXTFIELD, false);
        }
    });
})();
