
/*
 * Sample to set backgroun color where the record is asigned to login user
 * Copyright (c) 2016 Cybozu
 *
 * Licensed under the MIT License
 */
(function() {

    "use strict";

    var LIMIT_DAY = 5; // days to due date
    var LOGIN_COLOR = "#e5f0ff"; // Background color for login user

    // Show the number of records that are past due date and imcomplete status for login user
    function getRecords() {

        // Login user infromation
        var user = kintone.getLoginUser();

        // Set query
        var qryInfo = 'Person in (LOGINUSER()) and status not in ("Complete") and DueDate < TODAY()';
        var body = {
            app: kintone.app.getId(),
            query: qryInfo
        };
        // Asynchronous request
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body).then(function(resp) {
            if (resp['records'].length > 0) {
                alert("There are " + resp['records'].length + " records past due for " + user.name);
            }
        });
    }

    function checkIndexRecords(event) {
        var user = kintone.getLoginUser();                          // Lgin user information
        var today = moment().format("YYYY-MM-DD");                  // Format today's date

        // Get elements of the list
        var elCustomer = kintone.app.getFieldElements('Customer');  // Customer Name
        var elQType = kintone.app.getFieldElements('QType');        // Type of question
        var elStatus = kintone.app.getFieldElements('status');      // Status of response
        var elLimitDay = kintone.app.getFieldElements('DueDate');  // Due date
        var elPerson = kintone.app.getFieldElements('Person');      // Person in charge
        var elDetail = kintone.app.getFieldElements('Detail');      // Detail

        // Check due date and person in charge
        for (var i = 0; i < event.records.length; i++) {
            var record = event.records[i];

            // Select person in charge from the array
            var recperson = record['Person']['value'];
            var personList = [];
            for (var j = 0; j < recperson.length; j++) {
                personList.push(recperson[j].name);
            }

            // Check peson in charge
            if (personList.indexOf(user.name) > -1) {
                // Change bockground color if person in charge is same as login user
                if (elCustomer) {elCustomer[i].style.backgroundColor = LOGIN_COLOR; }
                if (elQType) {elQType[i].style.backgroundColor = LOGIN_COLOR; }
                if (elStatus) {elStatus[i].style.backgroundColor = LOGIN_COLOR; }
                if (elLimitDay) {elLimitDay[i].style.backgroundColor = LOGIN_COLOR; }
                if (elPerson) {elPerson[i].style.backgroundColor = LOGIN_COLOR; }
                if (elDetail) {elDetail[i].style.backgroundColor = LOGIN_COLOR; }
            }

            // Get due date
            var mt = moment(record['DueDate']['value']);
            // Check due date of imcomplete records
            if (record['status']['value'] !== "Complete") {

                if (!elLimitDay) {continue; }

                // Set text color in red if status is imcomplete
                if (mt.format("YYYY-MM-DD") < today) {
                    elLimitDay[i].style.color = 'red';
                    elLimitDay[i].style.fontWeight = 'bold';

                // Set text color in blue if due date is within 5 days to due date
                } else if (mt.add('days', -LIMIT_DAY).format("YYYY-MM-DD") <= today) {
                    elLimitDay[i].style.color = 'blue';
                }
            }
        }
    }

    // Change text color and background color according to the condition when the list is displayed
    kintone.events.on('app.record.index.show', function(event) {
        checkIndexRecords(event);
        getRecords();
    });
})();
