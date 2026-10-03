export default interface Gui {
  getBlockly: () => Promise<RealBlockly>
  getBlocklyEagerly: () => Promise<RealBlockly>
}