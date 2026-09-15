# 地图样式方案服务（Map Style Service）

## 接口介绍

| 项       | 值                                                                                         |
| -------- | ------------------------------------------------------------------------------------------ |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/MapStyleServer/style/{id}/styleJSON |
| 请求方式 | GET                                                                                        |
| 服务描述 | 该接口返回地图方案 JSON                                                                    |

## 参数说明

| 参数 | 类型   | 位置           | 说明                 |
| ---- | ------ | -------------- | -------------------- |
| id   | string | 路径参数       | 地图方案 ID，必填    |
| key  | string | URL 或表单参数 | 开发者应用密钥，必选 |

## 注意事项与已知文档问题

- 文档中接口地址在 `MapStyleServer/` 后多了一个空格（原文 `/ style/{id}/styleJSON`），此处已去掉。
- 返回的是完整地图方案 JSON，可直接作为 `minemap` 的 style 使用。
