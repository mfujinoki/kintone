(function(){
    'use strict'

    kintone.events.on(['app.record.detail.show','app.record.edit.show'],function(event){
      var record = event.record;

      if (document.getElementById('student_list')!== null)
      {
        return event;
      }

      var subtableSpace = kintone.app.record.getSpaceElement('student_list');

      var params = {
          "app": 104,
          "query": "class_code in (\"" + record.class_code.value + "\") order by student_no asc limit 500",
          "fields": ["$id", "student_code", "student_name"]
      };

      kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
          // success:生徒一覧を表示する
          var tableRecords = resp.records;
          var studentTable = "<table class=\"subtable-gaia show-subtable-gaia\">";
          studentTable += "<thead class=\"subtable-header-gaia\">";
          studentTable += "<tr>";
          studentTable += "<th class=\"subtable-label-gaia subtable-label-single_line_text-gaia\" style=\"width: 250px;\">";
          studentTable += "<span class=\"subtable-label-inner-gaia\">";
          studentTable += "コード";
          studentTable += "</span>";
          studentTable += "</th>";
          studentTable += "<th class=\"subtable-label-gaia subtable-label-single_line_text-gaia\" style=\"width: 250px;\">";
          studentTable += "<span class=\"subtable-label-inner-gaia\">";
          studentTable += "氏名";
          studentTable += "</span>";
          studentTable += "</th>";
          studentTable += "</tr>";
          studentTable += "</thead>";
          studentTable += "<tbody>";
          for (var i=0; i < tableRecords.length; i++)
          {
            studentTable += "<tr>";
            studentTable += "<td>";
            studentTable += "<div class=\"control-gaia control-single_line_text-field-gaia control-lookup-field-gaia control-show-gaia\">";
            studentTable += "<a href=\"/k/104/show#record=" + tableRecords[i].$id.value + "\" target=\"_blank\">";
            studentTable += "<span class=\"control-value-content-gaia\">" + tableRecords[i].student_code.value + "</span>";
            studentTable += "</a>";
            studentTable += "</div>"
            studentTable += "</td>";
            studentTable += "<td>";
            studentTable += "<div class=\"control-gaia control-single_line_text-field-gaia control-show-gaia\">";
            studentTable += "<span class=\"control-value-content-gaia\">" + tableRecords[i].student_name.value + "</span>";
            studentTable += "</div>"
            studentTable += "</td>";
            studentTable += "</tr>";
          }
          studentTable += "</tbody>";
          studentTable += "</table>";
          subtableSpace.innerHTML = studentTable;
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
