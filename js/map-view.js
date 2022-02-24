/*
 *  Map view sample program by amCharts
 * Copyright (c) 2022 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
  'use strict';
    // レコード一覧イベント
    kintone.events.on('app.record.index.show', function(event) {
      if (event.viewId !== 5684611) { // 作成したカスタマイズビューのIDを指定
        return event;
      }
      try {
        const map = am4core.create("mapdiv", am4maps.MapChart);
        map.geodata = am4geodata_japanLow;
        map.projection = new am4maps.projections.Miller();
        const polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.useGeodata = true;
        polygonSeries.mapPolygons.template.events.on("hit", function(ev) {
            map.zoomToMapObject(ev.target)
        });
        // マーカー用のインスタンス作成
        // https://www.amcharts.com/docs/v4/chart-types/map/#Image_series
        const imageSeries = map.series.push(new am4maps.MapImageSeries());
        imageSeries.sequencedInterpolation = true;

        const imageSeriesTemplate = imageSeries.mapImages.template;

        // マーカーの形を定義(丸を指定)
        const circle = imageSeriesTemplate.createChild(am4core.Circle);
        // マーカーの色
        circle.fill = am4core.color("blue");
        // マーカーのサイズ
        circle.radius = 5;
        // 枠線の色
        circle.stroke = am4core.color("gray");
        // 枠線のサイズ
        circle.strokeWidth = 2;
        // ツールチップに表示するテキスト dataのtextを表示できる
        circle.tooltipText = "{title}:{count}";

        // imageSeriesTemplateのlatitute,longitude(緯度経度)と配列の要素を紐付け
        imageSeriesTemplate.propertyFields.latitude = "latitude";
        imageSeriesTemplate.propertyFields.longitude = "longitude";
        const appId = kintone.app.getId();
        const query = kintone.app.getQuery();
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {'app': appId, 'query': query }).then(function(resp) {
          const records = resp.records;
          const markers = [];
          const count = 1;
          records.forEach(function(record) {
            const geoCode = center_of_prefecture.find(function(l){ return l.todofuken === record.city.value;});
            const found = markers.find(function(el) { return el.title === record.city.value;} );
            if (!found) {
              markers.push({
                "title": record.city.value,
                "latitude": geoCode.latitude,
                "longitude": geoCode.longitude,
                "count": count,
                "value": count
              });
            } else {
              found.count++;
          }
          });
          imageSeries.data = markers;
          return event;
        }, function(resp) {
          return event;
        });
      } catch (error) {
        console.log(error);
      }
      return event;
    });
  })();
// 都道府県の中心地データ
const center_of_prefecture = [{
  todofuken: "北海道",
  englishName: "Hokkaido",
  latitude: 43.420962,
  longitude: 142.781281
},
{
  todofuken: "青森県",
  englishName: "Aomori",
  latitude: 40.699056,
  longitude: 140.726924
},
{
  todofuken: "岩手県",
  englishName: "Iwate",
  latitude: 39.511756,
  longitude: 141.399429
},
{
  todofuken: "宮城県",
  englishName: "Miyagi",
  latitude: 38.381565,
  longitude: 140.941651
},
{
  todofuken: "秋田県",
  englishName: "Akita",
  latitude: 39.678886,
  longitude: 140.392163
},
{
  todofuken: "山形県",
  englishName: "Yamagata",
  latitude: 38.497668,
  longitude: 140.108578
},
{
  todofuken: "福島県",
  englishName: "Fukushima",
  latitude: 37.418743,
  longitude: 140.231252
},
{
  todofuken: "茨城県",
  englishName: "Ibaraki",
  latitude: 36.304975,
  longitude: 140.385361
},
{
  todofuken: "栃木県",
  englishName: "Tochigi",
  latitude: 36.683168,
  longitude: 139.817955
},
{
  todofuken: "群馬県",
  englishName: "Gunma",
  latitude: 36.481484,
  longitude: 138.923514
},
{
  todofuken: "埼玉県",
  englishName: "Saitama",
  latitude: 36.003615,
  longitude: 139.368331
},
{
  todofuken: "千葉県",
  englishName: "Chiba",
  latitude: 35.473969,
  longitude: 140.222304
},
{
  todofuken: "東京都",
  englishName: "Tokyo",
  latitude: 35.686991,
  longitude: 139.539242
},
{
  todofuken: "神奈川県",
  englishName: "Kanagawa",
  latitude: 35.40362,
  longitude: 139.349213
},
{
  todofuken: "新潟県",
  englishName: "Niigata",
  latitude: 37.368708,
  longitude: 138.888731
},
{
  todofuken: "富山県",
  englishName: "Toyama",
  latitude: 36.607484,
  longitude: 137.287216
},
{
  todofuken: "石川県",
  englishName: "Ishikawa",
  latitude: 36.772391,
  longitude: 136.778841
},
{
  todofuken: "福井県",
  englishName: "Fukui",
  latitude: 35.81261,
  longitude: 136.184399
},
{
  todofuken: "山梨県",
  englishName: "Yamanashi",
  latitude: 35.609615,
  longitude: 138.628685
},
{
  todofuken: "長野県",
  englishName: "Nagano",
  latitude: 36.149935,
  longitude: 138.024588
},
{
  todofuken: "岐阜県",
  englishName: "Gifu",
  latitude: 35.778724,
  longitude: 137.057877
},
{
  todofuken: "静岡県",
  englishName: "Shizuoka",
  latitude: 35.033282,
  longitude: 138.312185
},
{
  todofuken: "愛知県",
  englishName: "Aichi",
  latitude: 35.002511,
  longitude: 137.208724
},
{
  todofuken: "三重県",
  englishName: "Mie",
  latitude: 34.484291,
  longitude: 136.432514
},
{
  todofuken: "滋賀県",
  englishName: "Shiga",
  latitude: 35.22592,
  longitude: 136.139617
},
{
  todofuken: "京都府",
  englishName: "Kyoto",
  latitude: 35.220152,
  longitude: 135.517902
},
{
  todofuken: "大阪府",
  englishName: "Osaka",
  latitude: 34.598366,
  longitude: 135.545261
},
{
  todofuken: "兵庫県",
  englishName: "Hyogo",
  latitude: 35.068625,
  longitude: 134.794436
},
{
  todofuken: "奈良県",
  englishName: "Nara",
  latitude: 34.292803,
  longitude: 135.896845
},
{
  todofuken: "和歌山県",
  englishName: "Wakayama",
  latitude: 33.848677,
  longitude: 135.416815
},
{
  todofuken: "鳥取県",
  englishName: "Tottori",
  latitude: 35.391534,
  longitude: 133.850276
},
{
  todofuken: "島根県",
  englishName: "Shimane",
  latitude: 34.975087,
  longitude: 132.423277
},
{
  todofuken: "岡山県",
  englishName: "Okayama",
  latitude: 34.861972,
  longitude: 133.83399
},
{
  todofuken: "広島県",
  englishName: "Hiroshima",
  latitude: 34.588492,
  longitude: 132.792091
},
{
  todofuken: "山口県",
  englishName: "Yamaguchi",
  latitude: 34.226281,
  longitude: 131.430559
},
{
  todofuken: "徳島県",
  englishName: "Tokushima",
  latitude: 33.915461,
  longitude: 134.273465
},
{
  todofuken: "香川県",
  englishName: "Kagawa",
  latitude: 34.21968,
  longitude: 133.979044
},
{
  todofuken: "愛媛県",
  englishName: "Ehime",
  latitude: 33.661193,
  longitude: 132.838719
},
{
  todofuken: "高知県",
  englishName: "Kochi",
  latitude: 33.507085,
  longitude: 133.364174
},
{
  todofuken: "福岡県",
  englishName: "Fukuoka",
  latitude: 33.599679,
  longitude: 130.682867
},
{
  todofuken: "佐賀県",
  englishName: "Saga",
  latitude: 33.279436,
  longitude: 130.118294
},
{
  todofuken: "長崎県",
  englishName: "Nagasaki",
  latitude: 32.955619,
  longitude: 129.715641
},
{
  todofuken: "熊本県",
  englishName: "Kumamoto",
  latitude: 32.58723,
  longitude: 130.807836
},
{
  todofuken: "大分県",
  englishName: "Oita",
  latitude: 33.203809,
  longitude: 131.411655
},
{
  todofuken: "宮崎県",
  englishName: "Miyazaki",
  latitude: 32.200128,
  longitude: 131.353483
},
{
  todofuken: "鹿児島県",
  englishName: "Kagoshima",
  latitude: 31.355836,
  longitude: 130.410976
},
{
  todofuken: "沖縄県",
  englishName: "Okinawa",
  latitude: 26.477084,
  longitude: 127.922927
},
];
  