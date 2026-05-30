import { useEffect } from 'react'
import { useInspectionFormStore } from '@/features/inspection-requests/stores/inspection-form.store'

/**
 * Hook que limpa o estado do formulário de inspeção ao desmontar o componente.
 * Garante que o usuário sempre comece com um formulário limpo ao voltar à página.
 */
export function useClearFormOnUnmount() {
  const reset = useInspectionFormStore((state) => state.reset)

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])
}
