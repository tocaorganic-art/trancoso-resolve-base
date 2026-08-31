import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// Chamadas ao Base44 (auth, functions.invoke) não têm timeout embutido no
// SDK. Sem isso, uma rede lenta/instável (comum em celular) deixa a tela
// presa em loading para sempre, porque a promise nunca resolve nem rejeita.
export function withTimeout(promise, ms = 15000, timeoutMessage = 'Tempo esgotado. Verifique sua conexão e tente novamente.') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms)),
  ]);
}
