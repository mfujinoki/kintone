(function() {
  'use strict';
  // API キー
  const api_key = config.GOOGLE_SHEETS_API_KEY;
  // クライアントID
  const client_id = config.GOOGLE_SHEETS_CLIENT_ID;
  // スプレッドシートID
  const sheet_id = config.GOOGLE_SHEET_ID;
  // 認証用URL（読み取り／更新）
  const scope = 'https://www.googleapis.com/auth/spreadsheets';
  // Discovery Docs
  const discovery_docs = ['https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest'];

  // APIクライアントライブラリの初期化とサインイン
  function initClient() {
    gapi.client.init({
      'apiKey': api_key,
      'discoveryDocs': discovery_docs,
      'clientId': client_id,
      'scope': scope
    }, (error) => {
      alert('Googleへの認証に失敗しました。: ' + error);
    });
  }
  // APIクライアントとOAuth2ライブラリのロード
  gapi.load('client:auth2', initClient);

  // レコード詳細画面の表示後イベント
  kintone.events.on('app.record.detail.show', (event) => {
    // 増殖バグ回避
    if (document.getElementById('print_button') !== null) {
      return event;
    }
    // 画面上部にボタンを設置
    const printButton = document.createElement('button');
    printButton.id = 'print_button';
    printButton.innerHTML = '帳票出力';
    printButton.className = 'button-simple-cybozu geo-search-btn';
    printButton.style = 'margin-top: 30px; margin-left: 10px;';
    printButton.addEventListener('click', () => {
      printInvoice(event);
    });
    kintone.app.record.getSpaceElement('print_button_space').appendChild(printButton);
    return event;
  });

  async function printInvoice() {
    // レコードのデータの取得
    const record = kintone.app.record.get().record;
    if (record) {
      // Google認証済みのチェック
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        // Google認証の呼び出し
        await gapi.auth2.getAuthInstance().signIn();
      }

      // API リクエスト
      // リクエストパラメータの設定
      const params = {
        // スプレッドシートID
        spreadsheetId: sheet_id,
      };
      // 商品リストをArray変数にセット
      const productArray = [];
      if (record.見積明細.value.length > 0) {
        record.見積明細.value.forEach((item) => {
          productArray.push([item.value.product_name.value, null, null, null, null, item.value.数量.value,item.value.単価.value]);
        });
      }
      // スプレッドシートに出力するデータの設定
      const batchUpdateSpreadsheetRequestBody = {
        'valueInputOption': 'RAW',
        'data': [
          {
            'range': '\'Invoice\'!A1:A6',
            'majorDimension': 'COLUMNS',
            'values': [
              [record.customer_name.value + '様', record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
            ]
          },
          {
            'range': '\'Invoice\'!F5:H7',
            'majorDimension': 'ROWS',
            'values': [
              [record.quote_no.value, null, record.date.value],
              [],
              [record.customer_id.value, null, record.valid_until.value]
            ]
          },
          {
            'range': '\'Invoice\'!A12:A17',
            'majorDimension': 'COLUMNS',
            'values': [
              [record.customer_name.value + '様', record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
            ]
          },
          {
            'range': '\'Invoice\'!F12:F17',
            'majorDimension': 'COLUMNS',
            'values': [
              [record.customer_name.value + '様', record.company_name.value, record.postal_code.value, record.city.value, record.address.value, record.phone.value]
            ]
          },
          {
            'range': '\'Invoice\'!A39:A39',
            'majorDimension': 'COLUMNS',
            'values': [
              [record.note.value]
            ]
          },
          {
            'range': '\'Invoice\'!A21:G38',
            'majorDimension': 'ROWS',
            'values': productArray
          }
        ]
      };
      // スプレッドシートへの出力実行
      const request = gapi.client.sheets.spreadsheets.values.batchUpdate(params, batchUpdateSpreadsheetRequestBody);
      request.then((response) => {
        alert('帳票出力に成功しました。');
      }, (reason) => {
        alert('エラー: ' + reason.result.error.message);
      });
    }
  }
})();
