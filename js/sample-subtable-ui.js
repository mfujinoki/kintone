(function() {
    'use strict';

    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function(event) {
        var record = event.record;

        // 増殖バグ回避
        if (document.getElementById('student_list') !== null) {
            return event;
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
        // スペースを取得
        var subtableSpace = kintone.app.record.getSpaceElement('student_list');

        // Rest API
        var params = {
            "app": 104,
            "query": "class_code in (\"" + escapeHtml(record.class_code.value) + "\") order by student_no asc limit 500",
            "fields": ["$id", "student_code", "student_name"]
        };

        kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
            // success:生徒一覧を表示する
            var tableRecords = resp.records;
            var textCode = new kintoneUIComponent.Text({isDisabled: true});
            var textName = new kintoneUIComponent.Text({isDisabled: true});
            var table = new kintoneUIComponent.Table({
                rowTemplate: [textCode, textName],
                header: ['コード', '氏名']
            });

            var values = [];
            for (var i = 0; i < tableRecords.length; i++) {
              values.push([escapeHtml(tableRecords[i].student_code.value), escapeHtml(tableRecords[i].student_name.value)]);
            }
            table.setValue(values);
            subtableSpace.appendChild(table.render());
            
            /*var studentTable = "<table class=\"kintoneplugin-table\">";
            studentTable += "<thead>";
            studentTable += "<tr>";
            studentTable += "<th class=\"kintoneplugin-table-th\" style=\"width: 250px;\">";
            studentTable += "<span class=\"title\">";
            studentTable += "コード";
            studentTable += "</span>";
            studentTable += "</th>";
            studentTable += "<th class=\"kintoneplugin-table-th\" style=\"width: 250px;\">";
            studentTable += "<span class=\"title\">";
            studentTable += "氏名";
            studentTable += "</span>";
            studentTable += "</th>";
            studentTable += "</tr>";
            studentTable += "</thead>";
            studentTable += "<tbody>";
            for (var i = 0; i < tableRecords.length; i++) {
                studentTable += "<tr>";
                studentTable += "<td>";
                studentTable += "<div class=\"kintoneplugin-table-td-control\">";
                studentTable += "<a href=\"/k/104/show#record=" + escapeHtml(tableRecords[i].$id.value) + "\" target=\"_blank\">";
                studentTable += escapeHtml(tableRecords[i].student_code.value);
                studentTable += "</a>";
                studentTable += "</div>";
                studentTable += "</td>";
                studentTable += "<td>";
                studentTable += "<div class=\"kintoneplugin-table-td-control\">";
                studentTable += escapeHtml(tableRecords[i].student_name.value);
                studentTable += "</div>";
                studentTable += "</td>";
                studentTable += "</tr>";
            }
            studentTable += "</tbody>";
            studentTable += "</table>";
            subtableSpace.innerHTML = studentTable;*/
        }, function(error) {
            //error:エラーの場合はメッセージを表示する
            var errmsg = 'レコード取得時にエラーが発生しました。';
            // レスポンスにエラーメッセージが含まれる場合はメッセージを表示する
            if (error.message !== undefined) {
                errmsg += '\n' + error.message;
            }
            subtableSpace.appendChild(document.createTextNode(errmsg));
        });

        return event;


    });
})();
