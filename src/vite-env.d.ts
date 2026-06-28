/// <reference types="vite/client" />

declare module 'react-dom/client' {
  import { Container } from 'react-dom'
  export function createRoot(container: Container): {
    render(children: React.ReactNode): void
    unmount(): void
  }
}

declare module '*.css' {
  const content: string
  export default content
}
