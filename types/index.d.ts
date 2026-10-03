/// <reference path="../node_modules/@turbowarp/types/types/scratch-vm-extension.d.ts" />
/// <reference path="../node_modules/@turbowarp/types/types/scratch-blocks.d.ts" />

import type VM from "scratch-vm"
import type RenderWebGL from "scratch-render"
import type Cast from "./cast"
import type Translate from "./translate"
import type ScratchExtensions from "./extensions"
import type { RealBlockly } from "scratch-blocks"
import type ScratchExtensions from "./extensions"
import type External from "./external"
import type Gui from "./gui"

declare global {
  namespace Scratch {
    const vm: VM
    const Cast: Cast
    const translate: Translate
    const renderer: RenderWebGL
    const gui: Gui
    const external: External

    const fetch: typeof globalThis.fetch
    function canDownload(url: string, filename?: string): Promise<boolean>
    function canFetch(url: string): Promise<boolean>
    function canEmbed(url: string): Promise<boolean>
    function canGeolocate(): Promise<boolean>
    function canNotify(): Promise<boolean>
    function canOpenWindow(url: string): Promise<boolean>
    function canReadClipboard(): Promise<boolean>
    function canRecordAudio(): Promise<boolean>
    function canRecordVideo(): Promise<boolean>
    function canRedirect(url: string): Promise<boolean>
    function download(url: string, filename?: string): Promise<void>
    function openWindow(url: string, features?: string): Promise<Window | null>
    function redirect(url: string): Promise<void>
  }

  namespace ScratchExtensions { }
  namespace ScratchBlocks { }
  const Blockly: RealBlockly
}

export { ExtensionMetadata, ExtensionMetadata }