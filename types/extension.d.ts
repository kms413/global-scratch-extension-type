/**
 * The complete metadata object returned by `getInfo()`.
 *
 * This is the same type as `Scratch.Info`, so a class implementing
 * `ScratchExtension` can be passed straight to `Scratch.extensions.register()`
 * without a cast.
 */
type ExtensionInfo = Scratch.Info;

// 泛型 Args 用于定义扩展的参数类型：保留传入 T 的**实际属性类型**，同时强制所有属性必须是 Scratch 允许的基础类型（string | number | boolean）
type Args<T extends Record<string, string | number | boolean>> = {
  [K in keyof T]: T[K]
}



/**
 * The base class for a TurboWarp custom extension.
 * An instance of this class is passed to `Scratch.extensions.register()`.
 */
declare class ScratchExtension {
  /**
   * Returns the metadata for this extension. Called once by the Scratch VM
   * when the extension is loaded.
   */
  getInfo(): ExtensionInfo
}

export default ScratchExtension;

export type {
  ExtensionInfo,
  Args
}