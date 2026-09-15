# OGC WMTS 服务（OGC Web Map Tile Service）

本页包含 3 个接口：

- WMTS 操作（WMTS Operation
- WMTS 能力描述（WMTS Capabilities
- WMTS 切片（WMTS GetTile）

## WMTS 操作（WMTS Operation

| 项       | 值                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/WMTS/1.0.0/WMTSCapabilities.xml |
| 请求方式 | GET                                                                                                                         |
| 服务描述 |                                                                                                                             |

## WMTS 能力描述（WMTS Capabilities

| 项       | 值                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/{folderName}/{serviceName}/MapServer/WMTS/1.0.0/WMTSCapabilities.xml |
| 请求方式 | GET                                                                                                                         |
| 服务描述 |                                                                                                                             |

## WMTS 切片（WMTS GetTile）

| 项       | 值                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/MapServer/WMTS/tile/1.0.0/{Layer}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.{format} |
| 请求方式 | GET                                                                                                                                                                                   |
| 服务描述 |                                                                                                                                                                                       |

## 注意事项与已知文档问题

- 文档中「WMTS 切片」的接口地址把占位符写坏了一处（原文 `<folderName</<serviceName>`），此处已修正为 `<folderName>/<serviceName>`。
- 「WMTS 操作」与「WMTS 能力描述」两小节的接口地址在文档中完全相同，均为 `WMTSCapabilities.xml`；实际取切片需用「WMTS 切片」小节给出的地址。
