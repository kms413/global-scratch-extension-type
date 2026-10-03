# 入门教程：用 TypeScript 写你的第一个 Scratch 扩展

# Tutorial: Your first Scratch extension in TypeScript

本教程面向**从没写过扩展**的新手，带你从零写出、类型化并运行一个真正的 Scratch / TurboWarp 扩展。全程使用 TypeScript，并由 `scratch-extension-global-type` 提供完整类型。

This tutorial is for newcomers. It walks you from nothing to a real, fully-typed Scratch / TurboWarp extension using TypeScript and `scratch-extension-global-type`.

---

## 你将做出什么 / What you'll build

一个叫 **Text Tools** 的扩展，包含 4 个方块：

| 方块 | 类型 | 作用 |
| --- | --- | --- |
| `shout [WORD] [TIMES] times` | 报告（reporter） | 把文字重复若干遍 |
| `[A] is longer than [B]?` | 布尔（Boolean） | 比较两个字符串长度 |
| `wait [SECS] seconds and say [WORD]` | 命令（command，异步） | 等待若干秒后广播一条消息 |
| `repeat [TIMES] times` | 循环（loop） | 重复执行内部的积木 |

An extension called **Text Tools** with a reporter, a Boolean, an async command, and a custom loop block.

---

## 0. 前置知识：扩展、方块与函数签名 / Background

Scratch 扩展就是一个普通对象，它：

1. 用 `getInfo()` 告诉 VM「我有哪些方块」；
2. 为每个方块提供一个**与 `opcode` 同名的方法**。

运行时（VM）调用这个方法时，会传入两个参数：

```ts
methodName(args, util)
```

- `args`：方块上各输入框的值。Scratch 会把它们统一转成 `string | number | boolean`。
- `util`：运行时工具对象（本库导出为 `Utils` 类型），用来让线程等待、启动帽子积木、读取角色 / 运行时等。

方法里的 `this` 会绑定到你的扩展实例，所以可以把状态存在 `this` 上。

A Scratch extension is an object with `getInfo()` (declares the blocks) and one method per `opcode`. The VM calls it as `methodName(args, util)`. The method name must match the opcode by default. `args` holds the input values (always `string | number | boolean`), `util` is the runtime helper object, and `this` is bound to your extension instance.

---

## 1. 准备环境 / Set up

```bash
# 新建项目 / create a project
mkdir my-extension && cd my-extension
bun init -y

# 安装类型库（只在编译期起作用）/ install the types (compile-time only)
bun add -d scratch-extension-global-type
```

在 `tsconfig.json` 里启用它：

```json
{
  "compilerOptions": {
    "strict": true,
    "types": ["scratch-extension-global-type"]
  }
}
```

> 如果你还要用 `bun`、`node` 等全局类型，记得一并写进 `types` 数组，例如 `["scratch-extension-global-type", "bun"]`。
>
> If you also rely on other global type packages, list them too.

现在 `Scratch`、`ScratchExtensions`、`Blockly` 等全局对象在任何文件里都有类型了。

Now `Scratch`, `ScratchExtensions`, `Blockly` and friends are typed globally.

---

## 2. 第一个扩展 / Your first extension

新建 `src/index.ts`：

```ts
import type { ScratchExtension, ExtensionInfo, Utils } from "scratch-extension-global-type"

class TextTools implements ScratchExtension {
  getInfo(): ExtensionInfo {
    return {
      id: "texttools",
      name: Scratch.translate("Text Tools"),
      blocks: [
        {
          opcode: "shout",
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate("shout [WORD] [TIMES] times"),
          arguments: {
            WORD: { type: Scratch.ArgumentType.STRING, defaultValue: "hi" },
            TIMES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 }
          }
        }
      ]
    }
  }

  // 方法名 = opcode
  shout(args: { WORD: string; TIMES: number }): string {
    return args.WORD.repeat(Math.max(0, Math.floor(args.TIMES)))
  }
}

Scratch.extensions.register(new TextTools())
```

要点：

- `blockType: Scratch.BlockType.REPORTER` 表示这是一个报告积木，方法要 `return` 一个值。
- `text` 里的 `[WORD]`、`[TIMES]` 是**输入占位符**，必须和 `arguments` 里的键名一一对应。
- `arguments` 的每个键就是一个输入框：`type` 决定它长什么样，`defaultValue` 是默认值。
- 最后一行在模块顶层调用 `Scratch.extensions.register(...)`，文件被加载时就会注册。

Key points: `blockType` decides the block's kind; `text` placeholders must match the keys of `arguments`; `Scratch.extensions.register(...)` runs at module load.

---

## 3. 让参数类型更精确 / Typing arguments

方块入参在运行时**永远是 `string | number | boolean`**。你在 TypeScript 里标注的 `args` 类型只是给编辑器看的，要按方块的 `type` 来标注，才能得到正确的提示：

| `Scratch.ArgumentType` | 运行时值 | 建议标注 |
| --- | --- | --- |
| `STRING` | `string` | `string` |
| `NUMBER` | `number` | `number` |
| `BOOLEAN` | `boolean` | `boolean` |
| `ANGLE` | `number` | `number` |
| `COLOR` | `string`（`#rrggbb`） | `string` |

因为无法保证用户一定输入了正确类型，做数值计算前用 `Scratch.Cast` 更稳：

```ts
const n = Scratch.Cast.toNumber(args.TIMES) // 把任意值安全地变成数字
```

本库还导出一个宽松助手 `Args<T>`：给它一组参数名，它会把每个值放宽成 `string | number | boolean`。

```ts
import type { Args } from "scratch-extension-global-type"

type ShoutArgs = Args<{ WORD: string; TIMES: number }>
// { WORD: string | number | boolean; TIMES: string | number | boolean }
```

想要最精确的提示时，直接写行内类型（如上面的 `shout`）即可。

Annotate `args` according to the block's `ArgumentType`, and use `Scratch.Cast` when the value might not be what you expect. `Args<T>` is a loose helper for when you don't care about the exact per-argument type.

---

## 4. 更多方块类型 / More block types

把下面的方块加进 `blocks` 数组，并在类里补上对应方法。

**布尔积木**（返回 `boolean`）：

```ts
{
  opcode: "isLongerThan",
  blockType: Scratch.BlockType.BOOLEAN,
  text: Scratch.translate("[A] is longer than [B]?"),
  arguments: {
    A: { type: Scratch.ArgumentType.STRING },
    B: { type: Scratch.ArgumentType.STRING }
  }
}
```

```ts
isLongerThan(args: { A: string; B: string }): boolean {
  return args.A.length > args.B.length
}
```

**命令积木**（不返回值，`Promise<void>` 表示会有等待）：

```ts
{
  opcode: "waitAndSay",
  blockType: Scratch.BlockType.COMMAND,
  text: Scratch.translate("wait [SECS] seconds and say [WORD]"),
  arguments: {
    SECS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
    WORD: { type: Scratch.ArgumentType.STRING, defaultValue: "done" }
  }
}
```

```ts
async waitAndSay(args: { SECS: number; WORD: string }, util: Utils): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, args.SECS * 1000))
  util.startHats("event_whenbroadcastreceived", { BROADCAST_OPTION: args.WORD })
}
```

**自定义循环积木**（`branchCount: 1` 表示有 1 个内部分支）。循环积木的方法会被**反复调用**：每次调用判断是否还要再执行一遍分支，并用 `util.startBranch(1, true)` 让循环继续。

```ts
{
  opcode: "repeatTimes",
  blockType: Scratch.BlockType.LOOP,
  branchCount: 1,
  text: Scratch.translate("repeat [TIMES] times"),
  arguments: {
    TIMES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
  }
}
```

```ts
repeatTimes(args: { TIMES: number }, util: Utils): void {
  // 第一次进入时，把计数器存在当前栈帧里
  if (typeof util.stackFrame.loopCounter === "undefined") {
    util.stackFrame.loopCounter = Math.round(Scratch.Cast.toNumber(args.TIMES))
  }
  util.stackFrame.loopCounter -= 1
  if (util.stackFrame.loopCounter >= 0) {
    util.startBranch(1, true) // 执行一次内部分支，然后回到本积木
  }
}
```

**帽子积木**（`Scratch.BlockType.HAT`）：方法在每一帧被调用，返回 `true` 表示触发下面的脚本。需要「边沿触发」以外的行为时设置 `isEdgeActivated`。**事件积木**（`Scratch.BlockType.EVENT`）必须显式写 `isEdgeActivated: false`。

Hat blocks run every frame and return a boolean; event blocks must set `isEdgeActivated: false`.

---

## 5. 用 `util` 和运行时交互 / Using `util`

`util`（类型是 `Utils`）是你和运行时打交道的入口，常用成员：

```ts
import type { Utils } from "scratch-extension-global-type"

function demo(util: Utils): void {
  // 当前积木所属的角色 / 舞台
  const name: string = util.target.getName()
  const isStage: boolean = util.target.isStage

  // 运行时实例（scratch-vm）
  const runtime = util.runtime

  // 让当前线程暂停一帧（异步命令积木常用）
  util.yieldTick()

  // 启动帽子积木（例如广播）
  util.startHats("event_whenbroadcastreceived", { BROADCAST_OPTION: "go" })

  // 查询 IO 设备
  util.ioQuery("keyboard", "getKeyIsDown", ["space"])

  void [name, isStage, runtime]
}
```

完整成员列表见 [`types/blockly-utility.d.ts`](../types/blockly-utility.d.ts) 和 [README 的 "使用 util" 一节](../README.md#使用-util--working-with-util)。

See the full member list in the [README](../README.md#使用-util--working-with-util).

---

## 6. 异步与沙箱 / Async & sandbox

**异步**：命令积木的方法返回 `Promise` 时，VM 会等它结束再继续执行后续积木；报告积木也可以返回 `Promise`，其解析值会成为积木的结果。

A block function may be `async`; the VM waits for the returned Promise.

**沙箱**：当扩展运行在沙箱中（`Scratch.extensions.unsandboxed !== true`）时，网络、下载、打开窗口等能力要先通过对应的 `can*` 检查：

```ts
async function safeFetch(url: string): Promise<Response | null> {
  if (!(await Scratch.canFetch(url))) return null
  return Scratch.fetch(url)
}
```

其它检查：`Scratch.canDownload`、`Scratch.canOpenWindow`、`Scratch.canReadClipboard`、`Scratch.canNotify`、`Scratch.canGeolocate` …（完整列表见 README）。

Always gate sandboxed capabilities behind the matching `Scratch.can*` helper before using them.

---

## 7. 运行与发布 / Run & ship

**打包成一个 JS 文件**（TurboWarp 加载的是可执行的 JS，而不是 `.ts`）：

```bash
bun build ./src/index.ts --outfile ./dist/extension.js
```

**在 TurboWarp 里加载**：打开编辑器 → 添加扩展 → **加载自定义扩展 / Load custom extension** → 选择 `dist/extension.js`（或填写一个 URL）。加载后你会在分类栏看到「Text Tools」。

**发布**：把打包后的 `extension.js` 托管到一个可访问的地址，用户就能用「自定义扩展」的 URL 方式加载。记得每次改动后重新构建、重新加载。

Bundle to one JS file and load it via TurboWarp's "Load custom extension". Rebuild and reload after changes.

---

## 8. 常见问题 / FAQ

**Q：报错 `Cannot find name 'Scratch'`。**
没配置好类型。检查是否安装了 `scratch-extension-global-type`，以及 `tsconfig.json` 的 `types` 里是否包含它。

**Q：为什么 `args.WHERE` 说类型可能不是 `string`？**
Scratch 运行时会把输入统一转成 `string | number | boolean`。按方块的 `ArgumentType` 标注即可；做运算前可用 `Scratch.Cast.toNumber` / `toString` / `toBoolean` 转换。

**Q：积木没出现在分类栏。**
`text` 里的占位符（如 `[WORD]`）和 `arguments` 的键必须完全对应；`opcode` 也不能重复。

**Q：改了代码但 TurboWarp 里没变化。**
类型库不会影响运行；你需要重新 `bun build`，然后在编辑器里重新加载扩展。

**Q：`this` 在方法里指向谁？**
指向你 `register` 的那个扩展实例，所以可以用它保存状态。

**Q：我需要自己创建 `util` 吗？**
不需要。`util` 由 VM 注入到方法里。

---

## 9. 下一步 / Next steps

- 阅读 [README](../README.md) 的 API 参考，了解 `Scratch.Cast`、`Scratch.translate`、沙箱函数等。
- 查看 [`types/`](../types) 下的声明文件，了解每个类型的确切形状。
- 需要「声明式」方块的更多细节（菜单、动态菜单、参数类型）时，参考 [`@turbowarp/types`](https://github.com/TurboWarp/types) 中的 `Scratch.Block`、`Scratch.Argument` 等类型。