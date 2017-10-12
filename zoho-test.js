(function(){
  'use strinct';
  //Zoho Invoice API Token
  var token = config.ZOHO_INVOICE_TOKEN;
  //Zoho Invoice 組織ID
  var organization_id = config.ZOHO_INVOICE_ORG_ID;
  //Zoho Invoice API url
  var url = 'https://invoice.zoho.com/api/v3/invoices?authtoken=' + token + '&organization_id=' + organization_id;
  //API header
  var headers = {"Content-Type": "multipart/form-data"};

  //レコード詳細画面の表示後イベント
  kintone.events.on('app.record.detail.show',function(event){
    // 画面下部にボタンを設置
    var myFooterButton = document.createElement('button');
    myFooterButton.id = 'my_footer_button';
    myFooterButton.innerHTML = 'Zoho Invoiceにデータ送信';
    myFooterButton.onclick = function() {
      var form = new FormData();
form.append("JSONString", "{\n\t\"customer_id\": \"606161000000079001\",\n\t\"reference_number\" : \"20161106-E001\",\n\t\"date\" : \"2017-06-14\",\n\t\"notes\" : \"\",\n\t\"line_items\" : [\n\t\t{\n\t\t\t\"name\" : \"kinPro\",\n\t\t\t\"description\" : \"kintone Professional\",\n\t\t\t\"item_order\" : 0,\n\t\t\t\"rate\" : 24,\n\t\t\t\"quantity\" : 20,\n\t\t\t\"item_total\" : 480\n\t\t}\n\t]\n}\n");

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://invoice.zoho.com/api/v3/invoices?authtoken=ba0dd28f50f17ee0cdf01a1453586ea5&organization_id=47696963",
  "method": "POST",
  "headers": {
    "cache-control": "no-cache",
    "postman-token": "4328a2dc-e8d2-d101-cb54-a178e3f583a4"
  },
  "processData": false,
  "contentType": false,
  "mimeType": "multipart/form-data",
  "data": form
}

$.ajax(settings).done(function (response) {
  console.log(response);
});
    }
    kintone.app.record.getSpaceElement('my_space_field').appendChild(myFooterButton);
  });
})();
