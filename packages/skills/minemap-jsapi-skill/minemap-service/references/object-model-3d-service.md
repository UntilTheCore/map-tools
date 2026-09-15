# 3D 物体模型服务（3D Object Model Service）

## 接口介绍

| 项       | 值                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 接口地址 | http(s)://ip:port/tianjing-server/mapdata-api/services/<folderName>/<serviceName>/Physic3DModelServer/{cata1}/{cata2}/{name} |
| 请求方式 | GET                                                                                                                          |
| 服务描述 | 该接口返回 3D 模型文件                                                                                                       |

## 参数说明

| 参数        | 类型   | 位置           | 说明                 |
| ----------- | ------ | -------------- | -------------------- |
| folderName  | string | 路径参数       | 服务目录名称，可选   |
| serviceName | string | 路径参数       | 服务名称，必选       |
| cata1       | string | 路径参数       | 一级模型目录         |
| cata2       | string | 路径参数       | 二级模型目录         |
| name        | string | 路径参数       | 模型名称             |
| key         | string | URL 或表单参数 | 开发者应用密钥，必选 |

## 注意事项与已知文档问题

- 模型地址为三段路径（一级目录/二级目录/模型名），需按发布目录逐级拼接。
