
/*
 * Gantt chart display of sample program
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
 */

(function() {

    "use strict";

    // Date conversion for Gantt.
    function convertDateTime(str) {
        if (str !== "") {
            return '/Date(' + (new Date(str)).getTime() + ')/';
        }
        return "";
    }

    // To HTML escape
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Record list of events.
    kintone.events.on('app.record.index.show', function(event) {

        var records = event.records;
        var data = [];

        // Don't display when there is no record.
        if (records.length === 0) {
            return;
        }
        var elSpace = kintone.app.getHeaderSpaceElement();

        // I will adjust the style depending on the version of the design
        var uiVer = kintone.getUiVersion();
        switch (uiVer) {
            case 1:
                elSpace.style.marginLeft = "28px";
                elSpace.style.marginRight = "28px";
                elSpace.style.border = "solid 1px #ccc";
                break;
            default:
                elSpace.style.marginLeft = "15px";
                elSpace.style.marginRight = "15px";
                elSpace.style.border = "solid 1px #ccc";
                break;
        }

        // I create an element of Gantt chart.
        var elGantt = document.getElementById("gantt");
        if (elGantt === null) {
            elGantt = document.createElement("div");
            elGantt.id = "gantt";
            elSpace.appendChild(elGantt);
        }

        // To switch the moon, the day of the week, depending on the login user's Locale.
        var user = kintone.getLoginUser();
        var ganttMonths, ganttDow, ganttWaitmessage = "";
        switch (user['language']) {
            case "ja":
                ganttMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                ganttDow = ['日', '月', '火', '水', '木', '金', '土'];
                ganttWaitmessage = '表示するまでお待ちください。';
                break;
            case "zh":
                ganttMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
                ganttDow = ['日', '一', '二', '三', '四', '五', '六'];
                ganttWaitmessage = '请等待显示屏';
                break;
            default:
                ganttMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                ganttDow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                ganttWaitmessage = 'Please Wait...';
                break;
        }

        // Set the record.
        for (var i = 0; i < records.length; i++) {

            var colorGantt = "ganttGray";
            switch (records[i]['status']['value']) {
                case '未着手':
                    colorGantt = "ganttRed";
                    break;
                case '着手中':
                    colorGantt = "ganttOrange";
                    break;
                case '完了':
                    colorGantt = "ganttGreen";
                    break;
                case '延期':
                    colorGantt = "ganttBlue";
                    break;
                case '中止':
                    colorGantt = "ganttYellow";
                    break;
                default:
                    colorGantt = "ganttGray";
            }

            var descGantt = '<strong>' + escapeHtml(records[i]['project_name']['value']) + '</strong>';
            if (records[i]['start_date']['value']) {
                descGantt += '<br />' + 'From: ' + escapeHtml(records[i]['start_date']['value']);
            }
            if (records[i]['target_completion_date']['value']) {
                descGantt += '<br />' + 'To: ' + escapeHtml(records[i]['target_completion_date']['value']);
            }
            if (records[i]['status']['value']) {
                descGantt += "<br />" + escapeHtml(records[i]['status']['value']);
            }

            var obj = {
                id: escapeHtml(records[i]['$id']['value']),
                name: escapeHtml(records[i]['project_name']['value']),
                values: [{
                  from: convertDateTime(records[i]['start_date']['value']),
                  to: convertDateTime(records[i]['target_completion_date']['value']),
                  desc: descGantt,
                  label: escapeHtml(records[i]['project_name']['value']),
                  customClass: escapeHtml(colorGantt)
                }]
            };
            data.push(obj);
        }

        // Set in Gantt object.
        $(elGantt).gantt({
            source: data,
            navigate: "scroll",
            scale: "days",  // days,weeks,months
            maxScale: "months",
            minScale: "days",
            months: ganttMonths,
            dow: ganttDow,
            left: "70px",
            itemsPerPage: 100,
            waitText: ganttWaitmessage,
            scrollToToday: true
        });
    });
})();
