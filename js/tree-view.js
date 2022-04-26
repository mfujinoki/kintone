/*
 *  Tree view sample program by amCharts
 * Copyright (c) 2022 Cybozu
 *
 * Licensed under the MIT License
*/
(function() {
    'use strict';
      // レコード一覧イベント
      kintone.events.on('app.record.index.show', function(event) {
        if (event.viewId !== 5684640) { // 作成したカスタマイズビューのIDを指定
          return event;
        }
        try {
            // ルートエレメントを作成
            const root = am5.Root.new("chartdiv");
            // テーマを設定
            root.setThemes([
                am5themes_Animated.new(root)
            ]);
            // ラッパーコンテナーを作成
            const container = root.container.children.push(
                am5.Container.new(root, {
                width: am5.percent(100),
                height: am5.percent(100),
                layout: root.verticalLayout
                })
            );
            // シリーズを作成
            const series = container.children.push(
                am5hierarchy.Treemap.new(root, {
                singleBranchOnly: false,
                downDepth: 1,
                upDepth: -1,
                initialDepth: 2,
                valueField: "value",
                categoryField: "name",
                childDataField: "children",
                nodePaddingOuter: 0,
                nodePaddingInner: 0
                })
            );
            series.rectangles.template.setAll({
                strokeWidth: 2
            });
            const appId = kintone.app.getId();
            const query = kintone.app.getQuery();
            return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {'app': appId, 'query': query }).then(function(resp) {
              const records = resp.records;
              const children = [];
              records.forEach(function(record) {
                if (children.length > 0) {
                  const same_department = children.find(function (el) {return el.name === record.department.value});
                  if (!same_department) {
                    const child = {
                      name: record.department.value,
                      children: [
                        {
                          name: record.purpose.value,
                          value: parseInt(record.budget.value)
                        }
                      ]
                    };
                    children.push(child);
                  } else {
                    const child2 = {
                      name: record.purpose.value,
                      value: parseInt(record.budget.value)
                    }
                    same_department.children.push(child2);
                  }
                } else {
                  const child3 = {
                    name: record.department.value,
                    children: [
                      {
                        name: record.purpose.value,
                        value: parseInt(record.budget.value)
                      }
                    ]
                  };
                  children.push(child3);
                }
              });
              const data = {
                name: "Root",
                children: children
              };
              console.log(`Tree data is: ${JSON.stringify(data)}`);
              series.data.setAll([data]);
              series.set("selectedDataItem", series.dataItems[0]);
                
              //  ロード時にアニメ化
              series.appear(1000, 100);
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