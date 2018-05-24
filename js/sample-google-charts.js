(function() {
    "use strict";
    //ガントチャートのデータテーブル設定、ガントチャートの初期化、描画メソッドの呼び出しをするコールバック関数
    function drawChart(records) {
        var data = new google.visualization.DataTable();
        //Google Chartsのガントチャート用テーブルにフィールドを追加
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Resource');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');
        // レコードを設定
        var project_no = null;
        var project_name = null;
        var project_resource = null;
        var start_date = null;
        var end_date = null;
        var status = 0;
        for (var i = 0; i < records.length; i++) {
            project_no = records[i]['project_no']['value']; //プロジェクトNo
            project_name = records[i]['project_name']['value']; //プロジェクト名
            if (records[i]['project_member']['value'].length > 0) {
                project_resource = records[i]['project_member']['value'][0]['name']; //プロジェクトメンバー
            }
            if (records[i]['start_date']['value'] !== null) {
                start_date = new Date(records[i]['start_date']['value']); //開始日
            }
            if (records[i]['target_completion_date']['value'] !== null) {
                end_date = new Date(records[i]['target_completion_date']['value']); //終了予定日
            }
            status = Number(records[i]['status']['value']); //進捗状況

            if (start_date !== null && end_date !== null) {
                data.addRow([
                    project_no,
                    project_name,
                    project_resource,
                    start_date,
                    end_date,
                    null,
                    status,
                    null]);
            }
        }

        //ガントチャートのオプション設定
        var options = {
            height: records.length * 30 + 100,
            gantt: {
                trackHeight: 30
            }
        };
        //Google Visualizartion APIの初期化
        var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
        //ガントチャートの描画
        chart.draw(data, options);
    }
    // レコード一覧画面の表示後イベント
    kintone.events.on('app.record.index.show', function(event) {
        //アプリのレコード取得
        var records = event.records;

        // レコードが無い場合、チャートを非表示
        if (records.length === 0) {
            return;
        }
        //ヘッダースペースの要素を取得
        var elSpace = kintone.app.getHeaderSpaceElement();
        // チャート表示用要素を作成
        var elGantt = document.getElementById("chart_div");
        if (elGantt === null) {
            elGantt = document.createElement("div");
            elGantt.id = "chart_div";
            elSpace.appendChild(elGantt);
        }

        //Google Chart API ライブラリーのロード
        google.charts.load('current', {'packages': ['gantt'], 'language': 'ja'});//日本語を指定
        //APIロード後のコールバック関数の設定
        google.charts.setOnLoadCallback(
          function() {
            drawChart(records);
        });
    });
})();
