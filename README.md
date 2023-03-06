## mini-vite 核心原理

### 1、 基于浏览器 ESM 的动态加载

`vite` 利用浏览器对 ESM 的支持， 当 import 模块时， 浏览器下载被导入的模块。启动开发服务器后，当代码执行到模块加载时再请求对应模块的文件,本质上实现了动态加载。

先声明一个 `script` 标签类型为 module

```js
// html
<script type="module" src="/src/main.js"></script>
```

浏览器解析资源时， 发起一个 get 请求 main.js 文件

```js
// main.js
import { createApp } from "vue";
import App from "./App.vue";
createApp(App).mount("#app");
```

请求到了 main.js 文件， main.js 内部又导入了 vue、.vue 文件， 又会继续发起请求获取对应的模块， 服务器拦截请求，对文件做分解与整合， 然后再以 esm 格式返回给浏览器。整个过程跳过打包编译，做到了按需加载。

### 2、 基于 ESM 的 HMR 热更新

#### 主要过程如下：

- 创建一个 websocket 服务端和 client 文件，启动服务
- 通过 chokidar 监听文件变更
- 当代码变更后，服务端进行判断并推送到客户端
- 客户端根据推送的信息执行不同操作的更新

### 3、预构建

#### 3.1 支持 commonjs 依赖

`Vite` 是基于浏览器原生支持 ESM 的能力实现的，但要求用户的代码模块必须是 ESM 模块,
因此必须将 commonJs 的文件提前处理，转化成 ESM 模块并缓存入 node_modules/.vite

#### 3.2 减少模块和请求数量

常用的 `lodash` 工具库，里面有很多包通过单独的文件相互导入，而 `lodash-es` 这种包会有几百个子模块，当代码中出现 import { debounce } from 'lodash-es' 会发出几百个 `HTTP` 请求，这些请求会造成网络堵塞，影响页面的加载。

#### 3.3 基于 esbuild 的依赖预编译构建

esbuild 使用 Go 语言编写， 而 GO 天生具有多线程优势， 在 CPU 密集场景下，Go 更具性能优势。与常见打包如 webpack、 rollup 工具相比， esbuild
构建速度是它们的十几倍。

### 基于 rollup 的 插件机制

vite 打包是利用了 rollup 进行最终产物的构建， 基于 `Rollup` 设计的接口进行扩展, vite 保证兼容 rollup 插件同时加入了自己特有的钩子和属性进行扩展
