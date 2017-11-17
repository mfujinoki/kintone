(function() {
    "use strict";
    //API用パラメーター
    var token = config.ZOHO_CRM_TOKEN;
    var url = "https://crm.zoho.com/crm/private/json/Potentials/insertRecords?authtoken=" + token + "&scope=crmapi";
    //詳細画面
    kintone.events.on('app.record.detail.show',
        function(event) {
            // 画面下部にボタンを設置
            var myFooterButton = document.createElement('button');
            myFooterButton.id = 'my_footer_button';
            myFooterButton.innerHTML = 'Zoho CRMにデータ送信！';
            myFooterButton.onclick = function() {
                //レコードのデータの取得
                var rec = kintone.app.record.get();
                if (rec) {
                    var projectOwner = rec.record.project_owner.value[0].code;//案件担当者名
                    var projectName = rec.record.project_name.value;//案件名
                    var company = rec.record.company_name.value;//会社名
                    var stage = rec.record.stage.value;//ステージ
                    var closingDate = rec.record.closing_date.value;//見込み時期
                    var productName = rec.record.product_name.value;//製品名
                    var amount = rec.record.total.value;//小計

                    //XMLデータの処理
                    var xmlData = "";
                    xmlData = xmlData + "<Potentials>";
                    xmlData = xmlData + "<row no=\"1\">";
                    xmlData = xmlData + "<FL val=\"Potential Owner\">" + projectOwner + "</FL>";
                    xmlData = xmlData + "<FL val=\"Potential Name\">" + projectName + "</FL>";
                    xmlData = xmlData + "<FL val=\"Account Name\">" + company + "</FL>";
                    xmlData = xmlData + "<FL val=\"Stage\">" + stage + "</FL>";
                    xmlData = xmlData + "<FL val=\"Closing Date\">" + closingDate + "</FL>";
                    xmlData = xmlData + "<FL val=\"Amount\">" + amount + "</FL>";
                    xmlData = xmlData + "<FL val=\"Description\">" + productName + "</FL>";
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
                                alert("送信結果："+message);

                            } else {
                                var errorMessage = response.error.message;
                                var errorCode = response.error.code;
                                alert("エラーが発生しました："+errorCode + " " + errorMessage);
                            }
                        }
                    });
                }
            };
            kintone.app.record.getSpaceElement('my_space_field').appendChild(myFooterButton);
        }
    );
})();
