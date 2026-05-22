# 高德地图密钥配置

项目已从百度地图切换为 **高德 Web 端 JS API 2.0**。

## 1. 申请 Key

1. 打开 [高德开放平台控制台](https://console.amap.com/dev/key/app)
2. 创建应用 → 添加 Key → **服务平台选择「Web端(JS API)」**
3. 复制 **Key**；若控制台开启了「安全密钥」，一并复制 **安全密钥**

## 2. 填写本地配置

```bash
cd travel-guide-p1
cp amap-config.example.js amap-config.js
```

编辑 `amap-config.js`：

```javascript
window.AMAP_CONFIG = {
  key: "Web端(JS API) Key",       // 浏览器地图、联想
  webServiceKey: "Web服务 Key",   // 可选，服务端 REST
  securityJsCode: "",             // 未开启安全校验可留空
};
```

`amap-config.js` 已在 `.gitignore` 中，避免密钥进仓库。

## 3. 域名白名单

在 Key 详情里配置 **域名白名单**，例如：

- `localhost`
- `127.0.0.1`
- 你实际访问用的主机名

本地用 `python3 -m http.server` 或 Live Server 时，Referer 需与白名单一致。

## 4. 涉及页面

| 文件 | 用途 |
|------|------|
| `index.html` | 城市联想、地理编码 |
| `p3.html` | 景点地图、标记、路径线 |
| `amap-loader.js` | 统一加载脚本 |
| `amap-config.js` | 你的密钥（本地） |

## 5. 常见问题

- **地图空白 / INVALID_USER_KEY**：Key 类型不是 Web 端(JS API)，或白名单未包含当前域名。
- **安全密钥错误**：`securityJsCode` 与控制台不一致，或未开启却填了错误值。
- **合肥等城市无景点**：演示景点库仅内置北京/上海/杭州；地图仍会按第一页目的地定位，列表需后续接 POI 接口或扩充 `MOCK`。
