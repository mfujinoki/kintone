/*
 * This sample plug-in calls Zoho CRM API via Oauth2 and sync data between Zoho CRM and kinotne app with a click of the button
 *
 * Copyright (c) 2020 Cybozu
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
  'use strict';
  // Get plug-in configuration settings
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG) {
    return;
  }
  // Get each config setting
  const CONFIG_CLIENT_ID = CONFIG.client_id;
  const CONFIG_CLIENT_SECRET = CONFIG.client_secret;
  // Records View Event
  kintone.events.on('app.record.index.show', (event) => {
    // Sync Records function
    function updateRecords(zoho_data, kintone_data) {
      const newRecords = [];
      const existingRecords = [];
      zoho_data.forEach((data) => {
        const email = data.Email !== null ? data.Email : '';
        const company_name = data.Account_Name !== null ? data.Account_Name.name : '';
        const department_name = data.Department !== null ? data.Department : '';
        const full_name = data.Full_Name !== null ? data.Full_Name : '';
        const zip_code = data.Mailing_Zip !== null ? data.Mailing_Zip : '';
        const phone = data.Phone !== null ? data.Phone : '';
        const fax = data.Fax !== null ? data.Fax : '';
        const street = data.Mailing_Street !== null ? data.Mailing_Street + ', ' : '';
        const city = data.Mailing_City !== null ? data.Mailing_City + ', ' : '';
        const state = data.Mailing_State !== null ? data.Mailing_State + ', ' : '';
        const country = data.Mailing_Country !== null ? data.Mailing_Country : '';
        const kintone_records = kintone_data.filter((record) => record.email.value === email);
        if (kintone_records.length > 0) {
          kintone_records.forEach((record) => {
            const existingRecord = {
              'id': record.$id.value,
              'record': {
                'email': {
                  'value': email
                },
                'company_name': {
                  'value': company_name
                },
                'department': {
                  'value': department_name
                },
                'full_name': {
                  'value': full_name
                },
                'zip_code': {
                  'value': zip_code
                },
                'phone': {
                  'value': phone
                },
                'fax': {
                  'value': fax
                },
                'address': {
                  'value': street + city + state + country
                }
              }
            };
            existingRecords.push(existingRecord);
          });
        } else {
          const newRecord = {
            'email': {
              'value': email
            },
            'company_name': {
              'value': company_name
            },
            'department': {
              'value': department_name
            },
            'full_name': {
              'value': full_name
            },
            'zip_code': {
              'value': zip_code
            },
            'phone': {
              'value': phone
            },
            'fax': {
              'value': fax
            },
            'address': {
              'value': street + city + state + country
            }
          };
          newRecords.push(newRecord);
        }
      });
      if (existingRecords.length > 0) {
        const req = {
          'app': kintone.app.getId(),
          'records': existingRecords
        };
        kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', req, (resp) => {
          // success
          console.log(resp);
        }, (error) => {
          // error
          alert(error);
        });
      }
      if (newRecords.length > 0) {
        const req = {
          'app': kintone.app.getId(),
          'records': newRecords
        };
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', req, (resp) => {
          // success
          console.log(resp);
        }, (error) => {
          // error
          alert(error);
        });
      }
    }

    // const records = event.records;
    const params = 'scope=ZohoCRM.modules.all&&client_id=' + CONFIG_CLIENT_ID + '&response_type=code&redirect_uri=' +
                                encodeURIComponent('https://' + location.host + '/k/' + kintone.app.getId() + '/');
    // Query String 取得
    const queryString = location.search;
    if (queryString.substr(0, 6) === '?code=') {
      const authCode = queryString.substr(6).split('&');
      if (!authCode[0]) {
        alert('Zoho CRMの認証情報取得に失敗しました。');
        return event;
      }
      // 読み取った認可コードを使って認証する
      const data = 'grant_type=authorization_code' +
            '&client_id=' + CONFIG_CLIENT_ID +
            '&client_secret=' + CONFIG_CLIENT_SECRET +
            '&redirect_uri=' + encodeURIComponent('https://' + location.host + '/k/' + kintone.app.getId() + '/') +
            '&code=' + authCode[0];
      /*const data = {
        'redirect_uri': encodeURIComponent('https://' + location.host + '/k/' + kintone.app.getId() + '/'),
        'code': authCode[0]
      };*/
      kintone.plugin.app.proxy(PLUGIN_ID, 'https://accounts.zoho.com/oauth/v2/token', 'POST', {}, data).then((args) => {
      // kintone.plugin.app.proxy(PLUGIN_ID, 'https://00ccae31749393ad06e510968f7805f5.m.pipedream.net', 'POST', {}, body).then((args) => {
        if (args[1] === 200) {
          // success
          const responseBody = JSON.parse(args[0]);
          const header2 = {
            'Authorization': 'Zoho-oauthtoken ' + responseBody.access_token
          };
          kintone.proxy('https://www.zohoapis.com/crm/v2/Contacts', 'GET', header2, {}).then((args2) => {
            if (args2[1] === 200) {
              // success
              const responseBody2 = JSON.parse(args2[0]);
              const get_params = {
                app: kintone.app.getId(),
                query: 'order by レコード番号 asc limit 500'
              };
              kintone.api(kintone.api.url('/k/v1/records', true), 'GET', get_params).then((resp) => {
                // success
                const records = resp.records;
                updateRecords(responseBody2.data, records);
                const newUrl = location.href.split('?')[0]; // Remove auth code form URL
                location.href = newUrl; // Query Stringをクリア
              }).catch((error) => {
                // error
                alert(error);
              });
            } else {
              alert(args[0]);
            }
          }).catch((error) => {
            // error
            alert(error);
          });
        } else {
          alert(args[0]);
        }
      }).catch((error) => {
        alert(error);
      });
    }
    // 増殖を防ぐ
    if (kintone.app.getHeaderMenuSpaceElement().hasChildNodes()) {
      return event;
    }
    // 画面上部にボタンを設置
    const button = document.createElement('button');
    button.id = 'sync_button';
    button.innerHTML = 'Zoho CRM 同期';
    button.className = 'button-simple-cybozu geo-search-btn';
    button.style = 'margin-left: 30px;';
    button.addEventListener('click', () => {
      location.href = 'https://accounts.zoho.com/oauth/v2/auth?' + params;
    });
    kintone.app.getHeaderMenuSpaceElement().appendChild(button);
    return event;
  });
})(kintone.$PLUGIN_ID);
