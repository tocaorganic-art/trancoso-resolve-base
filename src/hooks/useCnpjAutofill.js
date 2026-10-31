import { useEffect, useRef, useState } from 'react';
import { consultarCnpj } from '@/lib/brasilApi';

/**
 * Quando o CNPJ digitado chega a 14 dígitos, consulta a BrasilAPI uma vez e
 * chama onEncontrado({ razaoSocial, nomeFantasia, situacao, ... }).
 * Quem chama decide o que preencher (regra: só campos ainda vazios).
 *
 * status: 'idle' | 'buscando' | 'ok' | 'nao_encontrado' | 'erro'
 */
export function useCnpjAutofill(cnpj, onEncontrado) {
  const [status, setStatus] = useState('idle');
  const [dados, setDados] = useState(null);
  const ultimoConsultado = useRef('');
  const callbackRef = useRef(onEncontrado);
  callbackRef.current = onEncontrado;

  useEffect(() => {
    const digits = String(cnpj || '').replace(/\D/g, '');
    if (digits.length !== 14) {
      ultimoConsultado.current = '';
      setStatus('idle');
      setDados(null);
      return undefined;
    }
    if (digits === ultimoConsultado.current) return undefined;
    ultimoConsultado.current = digits;

    let ativo = true;
    setStatus('buscando');
    consultarCnpj(digits).then((resultado) => {
      if (!ativo) return;
      if (!resultado) {
        setStatus('erro');
        return;
      }
      if (!resultado.encontrado) {
        setDados(null);
        setStatus('nao_encontrado');
        return;
      }
      setDados(resultado);
      setStatus('ok');
      callbackRef.current?.(resultado);
    });
    return () => {
      ativo = false;
    };
  }, [cnpj]);

  return { status, dados };
}
