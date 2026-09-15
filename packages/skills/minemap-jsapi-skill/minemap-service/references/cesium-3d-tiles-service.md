# 3D 切片服务（Cesium 3D Tiles Service）

## 接口介绍

| 项       | 值                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/Cesium3DTileServer/tile/tileset.json |
| 请求方式 | GET                                                                                                                    |
| 服务描述 | 该接口返回 3dTiles 切片的入口地址。支持 NoLod 模式和 Lod 模式。支持表 b3dm、i3dm、pnts、cmpt、glb 等切片文件数据。     |

## 参数说明

| 参数        | 类型   | 位置           | 说明                 |
| ----------- | ------ | -------------- | -------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选   |
| serviceName | string | 路径参数       | 服务名称，必选       |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选 |

## 注意事项与已知文档问题

- 该接口只返回 3D Tiles 入口地址，具体渲染由 Cesium 侧加载，非前端 SDK 直接消费。
