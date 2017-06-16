(function($) {
    "use strict";
    //API用パラメーター
    var token = "fd21709d6ad5e5d4cdfc7f8924adcff8";
    var url = "https://crm.zoho.com/crm/private/json/Potentials/insertRecords?authtoken=" + token + "&scope=crmapi";
    //■詳細画面
    "use strict";
    kintone.events.on('app.record.detail.show',
        function(event) {
            // メニュー右側の空白部分にボタンを設置
            var headerMenu = kintone.app.record.getHeaderMenuSpaceElement();
            var myIndexButton = document.createElement('button');
            myIndexButton.id = 'my_index_button';
            myIndexButton.innerHTML = 'Zoho CRMにデータ送信！';
            myIndexButton.onclick = function() {
                //レコードのデータの取得
                var rec = kintone.app.record.get();
                if (rec) {
                    var company = rec.record.会社名.value;
                    var personName = rec.record.先方担当者名.value;
                    var stage = rec.record.確度.value;
                    var closingDate = rec.record.日付.value;
                    var amount = rec.record.小計.value;

                    //XMLデータの処理
                    var xmlData = "";
                    xmlData = xmlData + "<Potentials>";
                    xmlData = xmlData + "<row no=\"1\">";
                    xmlData = xmlData + "<FL val=\"Potential Name\">" + company + "様商談</FL>";
                    xmlData = xmlData + "<FL val=\"Stage\">" + stage + "</FL>";
                    xmlData = xmlData + "<FL val=\"Contact Name\">" + personName + "</FL>";
                    xmlData = xmlData + "<FL val=\"Closing Date\">" + closingDate + "</FL>";
                    xmlData = xmlData + "<FL val=\"Amount\">" + amount + "</FL>";
                    xmlData = xmlData + "</row>";
                    xmlData = xmlData + "</Potentials>";

                    //パラメーターのエンコード
                    xmlData = encodeURI(xmlData);
                    url = url + "&xmlData=" + xmlData;

                  //HTTPリクエストの送信（Zoho CRMのAPIの呼び出し）
                    kintone.proxy(url, 'POST', {}, {}, function(body, status, headers) {
                        if (status >= 200 && status < 300) {
                            var responseJSON = JSON.parse(body);
                            var response = responseJSON.response;
                            if ('result' in response) {
                                var message = response.result.message;
                                var FL_array = response.result.recorddetail.FL;
                                headerMenu.append("<br/>送信結果："+message);
                                for (var i in FL_array) {
                                    if (FL_array[i].val == "Id") {
                                        var Id = FL_array[i].content;
                                        headerMenu.append("<br/><a href='https://crm.zoho.com/crm/EntityInfo.do?module=Potentials&id=" + Id + "' target='_blank'>商談データへのリンク</a>");
                                    }
                                }
                            } else {
                                var errorMessage = response.error.message;
                                var errorCode = response.error.code;
                                headerMenu.append("<br/>エラーが発生しました："+errorCode + " " + errorMessage);
                            }
                        }
                    });
                }
            };
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
        }
    );
})();
