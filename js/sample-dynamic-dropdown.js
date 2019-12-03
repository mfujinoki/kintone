(function() {
    "use strict";

    var RADIOBUTTON = "allergies";
    var TEXTFIELD = "other";
    var RADIO_VALUE = "Yes";
    var DROPDWON_VALUE = "Other";
    var CHOICE = "choice";

    // kintone UI Component constructor
    var dropdown = new kintoneUIComponent.Dropdown({
        items: [
                {
                    label: 'Drugs',
                    value: 'Drugs'
                },
                {
                    label: 'Food',
                    value: 'Food'
                }
        ]
    });
    var body = {
        'app': 97,
        'fields': [TEXTFIELD],
        'query': TEXTFIELD + ' != "" order by $id asc limit 500'
    };
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(resp) {
        // success
        var records = resp.records;
        var other = [];
        var items = dropdown.getItems();

        records.forEach(function(rcd) {
            other.push(rcd[TEXTFIELD]['value']);
        });
        var unique = _.uniq(other);
        unique.forEach(function(cause) {
            items.push({label: cause, value: cause});
        });
        items.push({label: DROPDWON_VALUE, value: DROPDWON_VALUE});
        dropdown.setItems(items);
    }, function(error) {
    // error
        console.log(error);
    });

    dropdown.hide();
    var showHideTextField = function(record) {

        //Hide/unhide fields depending on field choices
        if (record[RADIOBUTTON]['value'] === RADIO_VALUE) {
            dropdown.show();
            var show = false;
            var selected_value = dropdown.getValue();

            if (selected_value === DROPDWON_VALUE) {
                show = true;
            }
            kintone.app.record.setFieldShown(TEXTFIELD, show);
        } else {
            dropdown.hide();
            kintone.app.record.setFieldShown(TEXTFIELD, false);
        }
    };
    var setDropdownValues = function(record) {
        var selected_value = record[CHOICE]['value'];
        dropdown.setValue(selected_value);
    };

    //Detail Event
    kintone.events.on('app.record.detail.show', function(event) {
        kintone.app.record.setFieldShown(CHOICE, true);
        kintone.app.record.setFieldShown(TEXTFIELD, false);
        dropdown.hide();
    });
    //Create/Edit Events
    kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function(event) {
        if (event.type === 'app.record.edit.show') {
            setDropdownValues(event.record);
        }
        showHideTextField(event.record);
        kintone.app.record.getSpaceElement('cause').appendChild(dropdown.render());
        kintone.app.record.setFieldShown(CHOICE, false);
        dropdown.on('change', function(value) {
            var show = false;
            var selected_value = dropdown.getValue();
            if (selected_value === DROPDWON_VALUE) {
                show = true;
            }
            var rcrd = kintone.app.record.get();
            rcrd.record[CHOICE]['value'] = selected_value;

            kintone.app.record.set(rcrd);
            //If "Other" is selected for the allergy cause, show a text field
            //If "Other" is not selected for the allergy cause, don't show a text field
            kintone.app.record.setFieldShown(TEXTFIELD, show);
        });
    });
    //Change Events
    kintone.events.on(['app.record.create.change.' + RADIOBUTTON, 'app.record.edit.change.' + RADIOBUTTON], function(event) {
        showHideTextField(event.record);
        kintone.app.record.setFieldShown(CHOICE, false);
        dropdown.on('change', function(value) {
            var show = false;
            var selected_value = dropdown.getValue();
            if (selected_value === DROPDWON_VALUE) {
                show = true;
            }
            var rcrd = kintone.app.record.get();
            rcrd.record[CHOICE]['value'] = selected_value;

            kintone.app.record.set(rcrd);
            //If "Other" is selected for the allergy cause, show a text field
            //If "Other" is not selected for the allergy cause, don't show a text field
            kintone.app.record.setFieldShown(TEXTFIELD, show);
        });
    });
    //Submit Events
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function(event) {
        var selected_value = dropdown.getValue();
        if (selected_value === DROPDWON_VALUE) {
            event.record[CHOICE]['value'] = event.record[TEXTFIELD]['value'];
        }
        kintone.app.record.setFieldShown(CHOICE, false);
        return event;
    });
})();
