##  RuoYi-Cloud-Ant-Design简介

RuoYi-Cloud-Ant-Design是一套基于若依Cloud微服务版本为后端开发的一套基于Ant Design Vue的前端项目

#### 官方文档
[本项目官方文档](https://rycloud-docs.itsnkkka.cn/) 。
**在线体验往下滑↓**
#### 友情链接
[若依/RuoYi-Cloud（SpringCloud微服务版本）](https://gitee.com/y_project/RuoYi-Cloud) (本项目采取的后端)。

[若依SpringBoot版本](https://gitee.com/y_project/RuoYi-Vue) 。

[若依SpringBoot版 Ant Design前端](https://gitee.com/fuzui/RuoYi-Antdv) 。

## 启动项目

- 拉取项目代码

```bash
git clone git@gitee.com:xuezipeng/ruoyi-cloud-ant-design.git
```

- 安装依赖

```
npm install
```

- 开发模式运行

```
npm run serve
```

- 打包项目

```
npm run build
```

- eslint规范自动修复

```
npm run lint
```

## 项目结构

```
├── src/
    ├── api(存放接口)
    ├── assets(存放一些静态资源，图片等)
    ├── components(存放组件,由Ant Design Vue Pro提供)
    ├── config(项目配置文件如全局样式、路由)
    ├── core(项目核心文件夹，用于配置一些必备的组件/图标)
    ├── layouts(项目布局文件夹，路由以及固定的侧边栏所采用的组件都在这里哦)
    ├── locales(国际化包)
    ├── mock(Ant Design Vue Pro前端模拟数据，现已不用！)
    ├── router(动态路由的实现)
    ├── store(Vuex.Store配置)
    ├── utils(工具包)
    ├── views(存放页面)
```

## 内置功能（前端）

1. 用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2. 部门管理：配置系统组织机构（公司、部门、小组），树结构展现支持数据权限。
3. 岗位管理：配置系统用户所属担任职务。
4. 菜单管理：配置系统菜单，操作权限，按钮权限标识等。
5. 角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
6. 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7. 参数管理：对系统动态配置常用参数。
8. 通知公告：系统通知公告信息发布维护。
9. 操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
10. 登录日志：系统登录日志记录查询包含登录异常。
11. 在线用户：当前系统中活跃用户状态监控。
12. 定时任务：在线（添加、修改、删除)任务调度包含执行结果日志。
13. 代码生成：前后端代码的生成（java、html、xml、sql）支持CRUD下载 。
14. 系统接口：根据业务代码自动生成相关的api接口文档。
15. 服务监控：监视当前系统CPU、内存、磁盘、堆栈等相关信息。
16. 在线构建器：拖动表单元素生成相应的HTML代码。**(待开发！)**
17. 连接池监视：监视当前系统数据库连接池状态，可进行分析SQL找出系统性能瓶颈。

## 在线体验

- admin/admin123

演示地址：[http://182.61.136.176](http://182.61.136.176/) 由于在百度智能云没有备案域名，暂时以ip访问！

前端文档地址：**正在编写中！**

后端文档地址：http://doc.ruoyi.vip

## 演示图

| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113510.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113541.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113610.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113628.png) |
| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113749.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113826.png) |
| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113857.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113922.png) |
| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101113945.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101114121.png) |
| ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101114237.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101114256.png) |
| !![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101114540.png) | ![](https://snkkkait.oss-cn-beijing.aliyuncs.com/picgo/20210101114602.png) |
| ![img](https://oscimg.oschina.net/oscnet/up-ece3fd37a3d4bb75a3926e905a3c5629055.png) | ![img](https://oscimg.oschina.net/oscnet/up-92ffb7f3835855cff100fa0f754a6be0d99.png) |
| ![img](https://oscimg.oschina.net/oscnet/up-ff9e3066561574aca73005c5730c6a41f15.png) |                                                              |

## 若依微服务Ant Design版前端交流群(仅Ant Design前端)

QQ群群号:  1038609759

链接: 点击链接加入群聊【若依微服务Ant Design交流群】：https://jq.qq.com/?_wv=1027&k=Cq8fZnrj

## 若依微服务交流群(后端&ElementUI前端)

QQ群： [![加入QQ群](https://img.shields.io/badge/%E5%B7%B2%E6%BB%A1-42799195-blue.svg)](https://jq.qq.com/?_wv=1027&k=yqInfq0S) [![加入QQ群](https://img.shields.io/badge/%E5%B7%B2%E6%BB%A1-170157040-blue.svg)](https://jq.qq.com/?_wv=1027&k=Oy1mb3p8) [![加入QQ群](https://img.shields.io/badge/%E5%B7%B2%E6%BB%A1-130643120-blue.svg)](https://jq.qq.com/?_wv=1027&k=rvxkJtXK) [![加入QQ群](https://img.shields.io/badge/225920371-blue.svg)](https://jq.qq.com/?_wv=1027&k=rvxkJtXK) 点击按钮入群。



##  鸣谢:

\- [RuoYi-Cloud-最新技术栈的Java后端项目](https://doc.ruoyi.vip/ruoyi-cloud/)

\- [Ant Design Vue-开箱即用的高质量Vue组件](https://www.antdv.com/docs/vue/introduce-cn/)

\- [Ant Design Vue Pro基于Antd Vue的前端脚手架](https://gitee.com/sendya/ant-design-pro-vue)