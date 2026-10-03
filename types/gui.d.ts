/// <reference types="@turbowarp/types" />

export default interface Gui {
  getBlockly: () => Promise<ScratchBlocks.RealBlockly>
  getBlocklyEagerly: () => Promise<ScratchBlocks.RealBlockly>
}