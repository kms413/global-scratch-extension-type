declare namespace ScratchExtensions {
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

  function register(
    id: string,
    extension: ExtensionMetadata,
    info: { _getStatus: () => ExtensionStatus }
  ): void

  function getStatus(id: string): ExtensionStatus
}