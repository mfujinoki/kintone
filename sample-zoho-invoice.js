(function(){
  'use strinct';
  //Zoho Invoice API Token
  var token = 'ba0dd28f50f17ee0cdf01a1453586ea5';
  //Zoho Invoice 組織ID
  var organization_id = '47696963';
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

      var JSONString ='';
      //レコードのデータの取得
      var rec = kintone.app.record.get();
      if (rec) {

         var item_order = 0;
         JSONString = '{"customer_id" :' + rec.record.customer_no.value + ',';
         JSONString += '"reference_number" : "' + rec.record.No.value + '",';
         JSONString += '"date" : "' + rec.record.日付.value + '",';
         JSONString += '"notes" : "' + rec.record.notes.value + '",';
         JSONString += '"line_items" : [';
         $.each(rec.record.見積明細.value,function(i,item){

             JSONString += '{"name" : "' + item.value.type_name.value + '",';
             JSONString += '"description" : "' + item.value.product_name.value + '",';
             JSONString += '"item_order" : ' + item_order++ + ',';
             JSONString += '"rate" : ' + item.value.単価.value + ',';
             JSONString += '"quantity" : ' + item.value.数量.value + ',';
             JSONString += '"item_total" : ' + item.value.小計.value + '},';
         });
         JSONString += ']}';
         JSONString = JSONString.replace(",]","]");
         //Form-dataとしてデータ送信
         var data = new FormData();
         data.append("JSONString",JSONString);

         //HTTPリクエストの送信（Zoho InvoiceのAPIの呼び出し）
          kintone.proxy(url, 'POST', headers, data, function(body, status, headers) {
              alert(status);
              console.log(status, body);
              if (status >= 200 && status < 300) {
                  var responseJSON = JSON.parse(body);
                  var response = responseJSON.response;
                  var headerMenu = kintone.app.record.getHeaderMenuSpaceElement();
                  if ('result' in response) {
                      var message = response.result.message;
                      var FL_array = response.result.recorddetail.FL;
                      $(headerMenu).append("<br/>送信結果："+message);
                      for (var i in FL_array) {
                          if (FL_array[i].val == "Id") {
                              var Id = FL_array[i].content;
                              $(headerMenu).append("<br/><a href='https://invoice.zoho.com/portal/fujibiz/secure?CInvoiceID=" + Id + "' target='_blank'>Zoho Invoiceへのリンク</a>");
                          }
                      }
                  } else {
                      var errorMessage = response.error.message;
                      var errorCode = response.error.code;
                      $(headerMenu).append("<br/>エラーが発生しました："+errorCode + " " + errorMessage);
                  }
              }
          });
       }
    }
    kintone.app.record.getSpaceElement('my_space_field').appendChild(myFooterButton);
  });
})();
