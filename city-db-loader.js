/**
 * 城市数据：优先 JSON → SQLite db → 内置 fallback
 */
(function (global) {
  var DB_NAME = "旅游城市.db";
  var JSON_NAME = "旅游城市.json";

  var FALLBACK = [
    {
      id: 1,
      name: "上海",
      province: "上海市",
      city_id: "上海市|上海市",
      lng: 121.473701,
      lat: 31.230416,
      tagline: "外滩 · 弄堂 · 海派",
      sort_order: 1,
    },
    {
      id: 2,
      name: "南京",
      province: "江苏省",
      city_id: "江苏省|南京市",
      lng: 118.796877,
      lat: 32.060255,
      tagline: "六朝 · 秦淮 · 梧桐",
      sort_order: 2,
    },
    {
      id: 3,
      name: "成都",
      province: "四川省",
      city_id: "四川省|成都市",
      lng: 104.065735,
      lat: 30.659462,
      tagline: "火锅 · 熊猫 · 慢生活",
      sort_order: 3,
    },
  ];

  function assetUrl(filename) {
    return new URL(
      "data/" + encodeURIComponent(filename),
      global.location.href
    ).href;
  }

  function rowsFromExec(result) {
    if (!result || !result.length) return [];
    var block = result[0];
    var cols = block.columns;
    return block.values.map(function (row) {
      var o = {};
      cols.forEach(function (c, i) {
        o[c] = row[i];
      });
      return o;
    });
  }

  async function loadFromJson() {
    var resp = await fetch(assetUrl(JSON_NAME));
    if (!resp.ok) {
      throw new Error(JSON_NAME + " HTTP " + resp.status);
    }
    var list = await resp.json();
    if (!Array.isArray(list) || !list.length) {
      throw new Error(JSON_NAME + " 为空");
    }
    return list.sort(function (a, b) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }

  async function loadFromDb() {
    if (typeof global.initSqlJs !== "function") {
      throw new Error("sql.js 未加载");
    }
    var SQL = await global.initSqlJs({
      locateFile: function (file) {
        return "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/" + file;
      },
    });
    var resp = await fetch(assetUrl(DB_NAME));
    if (!resp.ok) {
      throw new Error(DB_NAME + " HTTP " + resp.status);
    }
    var buf = await resp.arrayBuffer();
    var db = new SQL.Database(new Uint8Array(buf));
    var result = db.exec(
      "SELECT id, name, province, city_id, lng, lat, tagline, sort_order FROM cities ORDER BY sort_order, id"
    );
    db.close();
    var rows = rowsFromExec(result);
    if (!rows.length) throw new Error(DB_NAME + " 中无城市数据");
    return rows;
  }

  global.CityDb = {
    cities: [],
    source: null,
    _ready: null,

    load: function () {
      if (this._ready) return this._ready;
      var self = this;
      this._ready = (async function () {
        var list = null;
        var errMsg = [];

        try {
          list = await loadFromJson();
          self.source = "json";
        } catch (e) {
          errMsg.push(String(e && e.message ? e.message : e));
        }

        if (!list && typeof global.initSqlJs === "function") {
          try {
            list = await loadFromDb();
            self.source = "db";
          } catch (e2) {
            errMsg.push(String(e2 && e2.message ? e2.message : e2));
          }
        }

        if (!list) {
          self.source = "fallback";
          if (errMsg.length) {
            console.warn("[CityDb] 远程加载失败，使用内置列表", errMsg);
          }
          list = FALLBACK.slice();
        }

        self.cities = list;
        return self.cities;
      })();
      return this._ready;
    },
  };
})(window);
