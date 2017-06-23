(function($) {
    "use strict";
    //API用パラメーター
    var token = "fd21709d6ad5e5d4cdfc7f8924adcff8";
    var url = "https://crm.zoho.com/crm/private/json/Potentials/insertRecords?authtoken=" + token + "&scope=crmapi";
    //■詳細画面
    "use strict";
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
                    var owner = rec.record.owner.value;
                    var projectName = rec.record.project_name.value;
                    var company = rec.record.company_name.value;
                    var contactName = rec.record.customer_name.value;
                    var stage = rec.record.stage.value;
                    var closingDate = rec.record.closing_date.value;
                    var productName = rec.record.product_name.value;
                    var amount = rec.record.total.value;

                    //XMLデータの処理
                    var xmlData = "";
                    xmlData = xmlData + "<Potentials>";
                    xmlData = xmlData + "<row no=\"1\">";
                    xmlData = xmlData + "<FL val=\"Potential Owner\">" + owner + "</FL>";
                    xmlData = xmlData + "<FL val=\"Potential Name\">" + projectName + "</FL>";
                    xmlData = xmlData + "<FL val=\"Account Name\">" + company + "</FL>";
                    xmlData = xmlData + "<FL val=\"Stage\">" + stage + "</FL>";
                    xmlData = xmlData + "<FL val=\"Contact Name\">" + contactName + "</FL>";
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
