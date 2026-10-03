# scratch-extension-global-type

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 为用 TypeScript 编写 Scratch / TurboWarp 扩展提供完整类型支持。
> Full TypeScript support for authoring Scratch / TurboWarp extensions.

本项目基于 [MIT 许可证](./LICENSE) 发布，可自由使用、修改与分发。
Licensed under the [MIT License](./LICENSE).

用 TypeScript 写 Scratch 扩展时，最麻烦的是那些「全局对象」没有类型：`Scratch`、`ScratchExtensions`、`Scratch.vm`、`Scratch.Cast`、`Scratch.translate`，以及每个方块函数会收到的 `args` 和 `util`。没有类型就只能到处写 `any`，或者自己手写一堆 `declare`。

本库把它们全部补齐，让你在编辑器里获得自动补全、参数提示和编译期报错，用 TypeScript 写扩展不再比 JavaScript 更麻烦。

When you author a Scratch extension in TypeScript, the globals that the player exposes are untyped — `Scratch`, `ScratchExtensions`, `Scratch.vm`, `Scratch.Cast`, `Scratch.translate`, and the `args` / `util` your block functions receive. This package declares all of them, so you get autocomplete, argument hints and compile-time errors instead of sprinkling `any` or hand-writing `declare` blocks.

本库**只包含 `.d.ts` 类型声明**：没有运行时代码，不会被打进产物，也不会改变扩展的运行行为。

This package is **types-only**: no runtime code, nothing added to your bundle, and zero effect on how your extension behaves.

## 为什么需要它 / Why

[`@turbowarp/types`](https://github.com/TurboWarp/types) 已经为「声明方块」的 API 提供了类型：`Scratch.ArgumentType`、`Scratch.BlockType`、`Scratch.TargetType`、`Scratch.extensions.register`、`Scratch.Info`、`Scratch.Block` 等。

它没有覆盖的，是扩展在运行时能拿到的那些全局对象：

- `Scratch.vm`、`Scratch.renderer`
- `Scratch.Cast`、`Scratch.translate`
- `Scratch.fetch`、`Scratch.external`
- 沙箱权限函数（`Scratch.canFetch`、`Scratch.canOpenWindow`、`Scratch.download` …）
- 方块函数收到的 `args` / `util`

本库补齐这一层，并把声明合并进同一个全局 `Scratch` 命名空间，因此它和 `@turbowarp/types` 可以无缝共存。

`@turbowarp/types` already types the block-declaration API. What it does not type are the runtime globals a player hands to extensions — `Scratch.vm`, `Scratch.Cast`, `Scratch.translate`, the sandbox helpers, and the `args` / `util` passed to block functions. This package fills that gap and merges its declarations into the same global `Scratch` namespace, so everything works together.

## 安装 / Installation

```bash
bun add -d scratch-extension-global-type
# 或者 / or
npm install --save-dev scratch-extension-global-type
```

作为开发依赖安装即可——它只在编译期起作用。
Install it as a dev dependency; it is only used at compile time.

## 配置 / Setup

**方式一：写进 `tsconfig.json`（推荐）**

```json
{
  "compilerOptions": {
    "types": ["scratch-extension-global-type"]
  }
}
```

**方式二：在你的入口文件顶部加一行三斜线指令**

```ts
/// <reference types="scratch-extension-global-type" />
```

配置好后，`Scratch`、`ScratchExtensions`、`Blockly`、`ScratchBlocks` 等全局对象在你的项目里随处可用。DOM 类型库会自动引入，`@turbowarp/types` 是普通依赖，因此不需要额外的 `paths` 映射或 `skipLibCheck` 变通。

After setup, the globals `Scratch`, `ScratchExtensions`, `Blockly` and `ScratchBlocks` become available everywhere. The DOM library is pulled in automatically and `@turbowarp/types` is a normal dependency, so no extra `paths` mappings are needed.

> **注意**：`compilerOptions.types` 一旦显式设置，就只会自动引入你列出的类型包。如果你还需要 `bun`、`node`、`vite/client` 等全局类型，请一并写进数组，例如 `["scratch-extension-global-type", "bun"]`。
>
> Note: once `compilerOptions.types` is set, only the listed packages are auto-included. Add any other global type packages (e.g. `bun`, `node`, `vite/client`) to the array as well.

## 快速上手 / Quick start

下面是一个最小但完整的扩展：一个把两个数相加的「报告积木」。

A minimal, complete extension — a reporter block that adds two numbers.

```ts
import type { Args,ScratchExtension, ExtensionInfo, Utils } from "scratch-extension-global-type"

class MathTools implements ScratchExtension {
  getInfo(): ExtensionInfo {
    return {
      id: "mathtools",
      name: Scratch.translate("Math Tools"),
      blocks: [
        {
          opcode: "add",
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate("[A] + [B]"),
          arguments: {
            A: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 2 }
          }
        }
      ]
    }
  }

  // 方块函数：VM 会用「与 opcode 同名的方法」并传入 (args, util)
  add(args: <{ A: number; B: number }>, util: Utils): number {
    void util
    return args.A + args.B
  }
}

Scratch.extensions.register(new MathTools())
```

想从头一步步学？请看 **[入门教程 / Tutorial](./docs/tutorial.md)**，它会带你从零写出、类型化并运行一个真正的扩展。

Want a step-by-step walkthrough? See the **[tutorial](./docs/tutorial.md)**, which builds, types and runs a real extension from scratch.

## 核心概念 / Core concepts

Scratch 扩展本质就是一个对象，它通过 `getInfo()` 返回一批方块声明；每个方块由 `opcode` 标识，运行时（VM）会调用与 `opcode` 同名的方法，并传入两个参数：

A Scratch extension is just an object whose `getInfo()` returns a list of block declarations. Each block has an `opcode`, and the VM calls the method with the same name, passing two arguments:

```ts
class MyExtension implements ScratchExtension {
  getInfo(): ExtensionInfo { /* 返回方块声明 / block declarations */ }

  greet(args: { NAME: string }, util: Utils): string {
    return Scratch.translate("Hello, {name}!", args.NAME)
  }
}
```


| 参数   | 类型         | 说明                                                                        |
| ------ | ------------ | --------------------------------------------------------------------------- |
| `args` | 你自己标注   | 方块上各输入框的值；Scratch 会把它们转成`string                             |
| `util` | `Utils`      | 运行时工具对象：yield、启动帽子、读取线程 / 角色 / 运行时、管理过程参数等。 |
| `this` | 你的扩展实例 | 调用时绑定到扩展实例，可以在实例上保存状态。                                |

- 报告 / 布尔方块返回一个值（`string | number | boolean`）；命令方块返回 `void` 或 `Promise<void>`。
- 方法名默认必须等于 `opcode`（也可以在方块声明里用 `func` 指定另一个方法名）。
- `util` 由 VM 注入，你不需要（也不应该）自己创建它。

Reporter / Boolean blocks return a value; command blocks return `void` or `Promise<void>`. The method name must match the `opcode` by default (or point `func` at another name). The `util` argument is injected by the VM.

更详细的概念讲解和范例见 [入门教程](./docs/tutorial.md)。
For a deeper walkthrough with examples, read the [tutorial](./docs/tutorial.md).

## 使用 `util` / Working with `util`

`util`（导出类型名 `Utils`）是扩展与运行时交互的主要入口。常用的成员：

```ts
import type { Utils } from "scratch-extension-global-type"

// 让当前线程暂停一帧（用于需要等待的循环 / 命令方块）
util.yieldTick()

// 启动所有匹配的帽子方块，例如广播
util.startHats("event_whenbroadcastreceived", { BROADCAST_OPTION: "go" })

// 读取 / 操作运行时
const runtime = util.runtime
const target = util.target

// 自定义循环方块：用栈计时器实现「等待 N 秒」
util.startStackTimer(1000)
if (util.stackTimerFinished()) { /* 时间到 */ }
```


| 成员                                                                                                                        | 说明                                            |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `util.target`                                                                                                               | 当前方块所属的角色 / 舞台。                     |
| `util.runtime`                                                                                                              | `scratch-vm` 运行时实例。                       |
| `util.yield()` / `util.yieldTick()`                                                                                         | 让当前线程暂停（下一帧继续）。                  |
| `util.startBranch(branchNum, isLoop)`                                                                                       | 进入方块的某个分支（自定义循环 / 条件方块用）。 |
| `util.startStackTimer(ms)` / `util.stackTimerFinished()` / `util.stackTimerNeedsInit()`                                     | 栈计时器，实现等待式循环。                      |
| `util.startProcedure(code)` / `util.getProcedureParamNamesAndIds(code)` / `util.getProcedureParamNamesIdsAndDefaults(code)` | 调用自定义过程、查询其参数。                    |
| `util.initParams()` / `util.pushParam(name, value)` / `util.getParam(name)`                                                 | 读取自定义过程的参数。                          |
| `util.stopThisScript()` / `util.stopOtherTargetThreads()` / `util.stopAll()`                                                | 停止当前脚本 / 同角色的其它脚本 / 全部脚本。    |
| `util.startHats(opcode, matchFields?, target?)`                                                                             | 启动帽子方块，返回启动的`Thread[]`。            |
| `util.ioQuery(device, func, args)`                                                                                          | 查询 IO 设备，如`keyboard`、`mouse`。           |

完整定义见 [`types/blockly-utility.d.ts`](./types/blockly-utility.d.ts)。

## 异步与沙箱 / Async blocks & sandbox

方块函数可以返回 `Promise`，VM 会等待它结束后再继续执行后续方块：

A block function may return a `Promise`; the VM waits for it to settle before continuing the script.

```ts
async waitThenSay(args: { SECS: number }, util: Utils): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, args.SECS * 1000))
  util.startHats("event_whenbroadcastreceived", { BROADCAST_OPTION: "done" })
}
```

在沙箱（`Scratch.extensions.unsandboxed !== true`）中，网络、下载、打开窗口等能力都要先经过对应的 `can*` 检查：

Inside the sandbox, network / download / window access must be gated behind the matching `can*` check:

```ts
async safeFetch(url: string): Promise<Response | null> {
  if (!(await Scratch.canFetch(url))) return null
  return Scratch.fetch(url)
}
```

## API 参考 / API reference

### 全局对象 / Global objects


| 成员 / Member       | 类型 / Type   | 说明 / Description                                                                      |
| ------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `Scratch.vm`        | `VM`          | `scratch-vm` 实例 / the `scratch-vm` instance.                                          |
| `Scratch.renderer`  | `RenderWebGL` | `scratch-render` WebGL 渲染器 / the renderer.                                           |
| `Scratch.Cast`      | `typeof Cast` | Scratch 风格的类型转换 / 比较（`toNumber`、`toString`、`compare` …）。                 |
| `Scratch.translate` | `Translate`   | 翻译一条消息，支持`{placeholder}` 参数；另有 `language`、`setup`。                      |
| `Scratch.external`  | `External`    | 扩展可用的`external` API：`importModule`、`fetch`、`dataURL`、`blob`、`evalAndReturn`。 |
| `Scratch.gui`       | `Gui`         | 编辑器入口（`getBlockly()` / `getBlocklyEagerly()`）。多数扩展用不到。                  |

### 沙箱权限 / Sandbox permission helpers

每个函数返回 `Promise<boolean>`，表示当前沙箱是否允许对应操作。
Every helper returns a `Promise<boolean>` describing whether the action is permitted.


| 函数 / Function                       | 说明 / Description    |
| ------------------------------------- | --------------------- |
| `Scratch.canDownload(url, filename?)` | 是否允许下载`url`。   |
| `Scratch.canFetch(url)`               | 是否允许请求`url`。   |
| `Scratch.canEmbed(url)`               | 是否允许嵌入`url`。   |
| `Scratch.canGeolocate()`              | 是否允许使用定位。    |
| `Scratch.canNotify()`                 | 是否允许弹出通知。    |
| `Scratch.canOpenWindow(url)`          | 是否允许打开新窗口。  |
| `Scratch.canReadClipboard()`          | 是否允许读取剪贴板。  |
| `Scratch.canRecordAudio()`            | 是否允许录音。        |
| `Scratch.canRecordVideo()`            | 是否允许录像。        |
| `Scratch.canRedirect(url)`            | 是否允许跳转到`url`。 |

### 沙箱工具函数 / Sandbox utility functions


| 函数 / Function                      | 说明 / Description                                  |
| ------------------------------------ | --------------------------------------------------- |
| `Scratch.fetch`                      | 沙箱化的`fetch`，类型为 `typeof globalThis.fetch`。 |
| `Scratch.download(url, filename?)`   | 下载`url`，返回 `Promise<void>`。                   |
| `Scratch.openWindow(url, features?)` | 打开新窗口，返回`Window                             |
| `Scratch.redirect(url)`              | 跳转当前页面，返回`Promise<void>`。                 |

### 其它全局 / Other globals


| 全局 / Global       | 说明 / Description                                                           |
| ------------------- | ---------------------------------------------------------------------------- |
| `ScratchExtensions` | 另一套扩展注册对象，提供`register(id, extension, info)` 与 `getStatus(id)`。 |
| `Blockly`           | 全局`Blockly` 实例，类型为 `ScratchBlocks.BlocklyGlobal                      |
| `ScratchBlocks`     | `scratch-blocks` 命名空间（由 `@turbowarp/types` 提供）。                    |

## 导出类型 / Exported types

```ts
import type {
  ScratchExtension, // 扩展基类：实现 getInfo(): ExtensionInfo
  ExtensionInfo,    // getInfo() 的返回值，等价于 Scratch.Info
  Args,             // 参数对象的宽松类型助手
  Utils              // 方块函数收到的 util 参数类型
} from "scratch-extension-global-type"
```


| 导出 / Export      | 说明 / Description                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `ScratchExtension` | 扩展的基类 / 接口形状：实现`getInfo(): ExtensionInfo`。可直接 `implements`。                                                    |
| `ExtensionInfo`    | `getInfo()` 返回的元数据，是 `Scratch.Info` 的别名，可直接传给 `Scratch.extensions.register()`。                                |
| `Utils`            | 方块函数第二个参数`util` 的类型，对应 VM 的 `BlockUtility`（见 [`types/blockly-utility.d.ts`](./types/blockly-utility.d.ts)）。 |
| `Args<T>`          | 给定一组参数名，把它们的值放宽为运行时实际可能传入的`string                                                                     |

### `Args` 用法 / `Args` usage

```ts
import type { Args } from "scratch-extension-global-type"

type GreetArgs = Args<{ NAME: string; TIMES: number }>
// 等价于 / equivalent to:
// { NAME: string | number | boolean; TIMES: string | number | boolean }
```

Scratch 运行时会对方块输入做类型转换，因此报告积木的入参在类型上永远可能不是你以为的那个类型。如果你在方块声明里写了 `type: Scratch.ArgumentType.NUMBER`，直接标注 `args: { A: number }` 就能获得最精确的类型。

## 要求 / Requirements

- TypeScript 5.0 或更高版本（建议开启 `strict`）。
- 这些全局对象只在实现了扩展沙箱 API 的 TurboWarp 兼容环境中存在。拿不准时，先用对应的 `Scratch.can*` 检查。
- TypeScript 5.0+ (with `strict` recommended).
- The globals only exist inside TurboWarp-compatible players that implement the extension sandbox APIs. When in doubt, gate calls behind the matching `Scratch.can*` helper.

## 已知限制 / Known limitations

- `ScratchExtensions.register` 声明为三个参数 `(id, extension, { _getStatus })`，而不是某些播放器支持的简写形式。
  `ScratchExtensions.register` is declared with three arguments rather than the shorter form some players accept.

## 工作原理 / How it works

[`types/index.d.ts`](./types/index.d.ts) 引入 `@turbowarp/types` 并声明 `Scratch` / `ScratchExtensions` 等全局；每个对象的形状放在单独的文件里：

`types/index.d.ts` references `@turbowarp/types` and declares the `Scratch` / `ScratchExtensions` globals. Each object's shape lives in its own file:


| 文件 / File                                                        | 声明 / Declares                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| [`types/scratch.d.ts`](./types/scratch.d.ts)                       | 全局`Scratch` 对象的形状 / shape of the global `Scratch` |
| [`types/scratch-extensions.d.ts`](./types/scratch-extensions.d.ts) | 全局`ScratchExtensions` 对象的形状                       |
| [`types/extension.d.ts`](./types/extension.d.ts)                   | `ScratchExtension`、`ExtensionInfo`、`Args`              |
| [`types/blockly-utility.d.ts`](./types/blockly-utility.d.ts)       | `Utils`（VM 的 `BlockUtility`）                          |
| [`types/gui.d.ts`](./types/gui.d.ts)                               | `Gui`                                                    |
| [`types/external.d.ts`](./types/external.d.ts)                     | `External`                                               |
| [`types/cast.d.ts`](./types/cast.d.ts)                             | `Cast`                                                   |
| [`types/translate.d.ts`](./types/translate.d.ts)                   | `Translate`                                              |

## 文档 / Docs

- [入门教程 / Tutorial](./docs/tutorial.md) — 从零开始写一个可运行的扩展。
