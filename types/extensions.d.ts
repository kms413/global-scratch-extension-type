
interface ExtensionMetadata {
  displayName?: string
  url?: string
  blocks: Array<string | [string, string, string, ...unknown[]]>
  menus?: Record<string, unknown>
}

interface ExtensionStatus {
  status: number
  msg?: string
}

namespace ScratchExtensions {
  function register(
    id: string,
    extension: ExtensionMetadata,
    info: { _getStatus: () => ExtensionStatus }
  ): void

  function getStatus(id: string): ExtensionStatus
}

export default ScratchExtensions