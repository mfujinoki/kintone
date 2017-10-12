(function() {
    "use strict";
    // API キー
    var api_key = 'AIzaSyCwAdw_BxT0WmK1paDxdphWIQodE9Hdiiw';
    // クライアントID
    var client_id = '478055048977-sbhonj53kd5q7oagj1fr2qlt5jkka85g.apps.googleusercontent.com';

    // スプレッドシートID
    var sheet_id = '1yamZyhRrOz9n6HtTDHndpXcD4FoU0cmnLMjGlas_3TM';

    // 認証用URL（読み取り）
    var scope = 'https://www.googleapis.com/auth/spreadsheets';

    //Discovery Docs
    var discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest'];

    // APIクライアントとOauth2モジュールのロード
    // モジュールロード後のinitClient関数の呼び出し
    gapi.load('client:auth2', {
      callback: function() {
        // gapi.clientのイニシャライズ処理
        initClient();
      },
      onerror: function() {
        // エラー時の処理
        alert('gapi.client のロードに失敗しました!');
      }
    });

    function initClient() {
        gapi.client.init({
            'apiKey': api_key,
            'discoveryDocs': discovery_docs,
            'clientId': client_id,
            'scope': scope
        }).then(function () {
            // Google認証済みのチェック
            if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
              // Google認証の呼び出し
              gapi.auth2.getAuthInstance().signIn();
            }
        });
    }
    //レコード詳細画面の表示後イベント
    kintone.events.on('app.record.detail.show', function(event) {
      // 増殖バグ回避
      if (document.getElementById('print_button') !== null) {
          return event;
      }
      // 画面上部にボタンを設置
      var printButton = document.createElement('button');
      printButton.id = 'print_button';
      printButton.innerHTML = '帳票出力';
      printButton.className = "button-simple-cybozu geo-search-btn";
      printButton.style = "margin-top: 30px; margin-left: 10px;";
      printButton.addEventListener('click', function() {
            printInvoice(event);
      });
      kintone.app.record.getSpaceElement('print_button_space').appendChild(printButton);

      return event;
    });

    function printInvoice(event){
      //レコードのデータの取得
      var record = kintone.app.record.get().record;
      if (record) {
        // Google認証済みのチェック
        if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
          // Google認証の呼び出し
          gapi.auth2.getAuthInstance().signIn();
          alert('Google認証されていません。');
          return;
        }

        // API リクエスト
        // リクエストパラメータの設定
        var params = {
          // 　スプレッドシートID
          spreadsheetId: sheet_id,
        };
        //商品リストをArray変数にセット
        var productArray = [];
        $.each(record.見積明細.value,function(i,item){
          productArray.push([item.value.product_name.value,null,null,null,null,item.value.数量.value,item.value.単価.value]);
        });
        //スプレッドシートに出力するデータの設定
        var batchUpdateSpreadsheetRequestBody = {
          "valueInputOption": "RAW",
          "data": [
            {
              "range": "'Invoice'!A1:A6",
              "majorDimension": "COLUMNS",
              "values": [
                [record.customer_name.value + "様", record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
              ]
            },
            {
              "range": "'Invoice'!F5:H7",
              "majorDimension": "ROWS",
              "values": [
                [record.quote_no.value, null, record.date.value],
                [],
                [record.customer_id.value, null, record.valid_until.value]
              ]
            },
            {
              "range": "'Invoice'!A12:A17",
              "majorDimension": "COLUMNS",
              "values": [
                [record.customer_name.value + "様", record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
              ]
            },
            {
              "range": "'Invoice'!F12:F17",
              "majorDimension": "COLUMNS",
              "values": [
                [record.customer_name.value + "様", record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
              ]
            },
            {
              "range": "'Invoice'!A39:A39",
              "majorDimension": "COLUMNS",
              "values": [
                [record.note.value]
              ]
            },
            {
              "range": "'Invoice'!A21:G38",
              "majorDimension": "ROWS",
              "values": productArray
            }
          ]
        };
        //スプレッドシートへの出力実行
        var request = gapi.client.sheets.spreadsheets.values.batchUpdate(params, batchUpdateSpreadsheetRequestBody);
        request.then(function(response) {
          alert("帳票出力に成功しました。");
        }, function(reason) {
          alert('エラー: ' + reason.result.error.message);
        });
      }
    }
})();
