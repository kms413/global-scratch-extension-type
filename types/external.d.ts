export default interface External {
  importModule: (url: string) => Promise<unknown>
  fetch: (url: string) => Promise<Response>
  dataURL: (url: string) => Promise<string>
  blob: (url: string) => Promise<Blob>
  evalAndReturn: (url: string, expression: string) => Promise<unknown>
}