type Message = string | {
  id: string,
  default: string,
  description?: string
}

type Setup = (val: Record<string, Record<string, string>>) => void

export default interface Translate {
  (message: Message, ...args: string[]): string
  language: string
  setup: Setup
}