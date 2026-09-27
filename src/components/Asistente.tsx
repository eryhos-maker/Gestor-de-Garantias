import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HelpCircle, Send, X } from 'lucide-react';
import { FAQS, Faq, buscarRespuestas } from '../lib/faq';

interface Mensaje {
  de: 'usuario' | 'asistente';
  texto: string;
  sugerencias?: Faq[];
}

const SUGERENCIAS_INICIALES = [FAQS[0], FAQS[2], FAQS[11], FAQS[13]];

const BIENVENIDA: Mensaje = {
  de: 'asistente',
  texto: 'Hola, soy el Asistente de Garantías. Pregúntame cómo registrar, embarcar, avisar o entregar una garantía.',
  sugerencias: SUGERENCIAS_INICIALES,
};

/** Asistente de dudas frecuentes: responde con el manual, sin internet extra ni costo. */
export default function Asistente() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState('');
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto]);

  const responder = (pregunta: string, faqElegida?: Faq) => {
    const q = pregunta.trim();
    if (!q) return;
    const encontradas = faqElegida ? [faqElegida] : buscarRespuestas(q);
    const respuesta: Mensaje = encontradas.length
      ? { de: 'asistente', texto: encontradas[0].respuesta, sugerencias: encontradas.slice(1) }
      : {
          de: 'asistente',
          texto:
            'No tengo esa respuesta. Pregunta a tu supervisor comercial o al gerente. Mientras, quizá te sirva alguna de estas:',
          sugerencias: SUGERENCIAS_INICIALES,
        };
    setMensajes(m => [...m, { de: 'usuario', texto: q }, respuesta]);
    setTexto('');
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    responder(texto);
  };

  return (
    <>
      <button
        onClick={() => setAbierto(a => !a)}
        className="fixed bottom-5 right-5 z-20 flex items-center gap-2 px-4 py-3 bg-brand-red text-white rounded-full shadow-lg hover:bg-brand-red-light"
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente de dudas'}
      >
        {abierto ? <X size={20} /> : <HelpCircle size={20} />}
        <span className="text-sm font-medium hidden sm:inline">{abierto ? 'Cerrar' : '¿Dudas?'}</span>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[70vh]"
          >
            <div className="px-4 py-3 bg-brand-blue text-white rounded-t-2xl">
              <p className="font-semibold">Asistente de Garantías</p>
              <p className="text-xs text-white/80">Respuestas del manual de garantías de Ferre Mina</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {mensajes.map((m, i) => (
                <div key={i} className={m.de === 'usuario' ? 'flex justify-end' : ''}>
                  <div
                    className={
                      m.de === 'usuario'
                        ? 'bg-brand-blue text-white px-3 py-2 rounded-xl rounded-br-sm max-w-[85%]'
                        : 'bg-slate-100 text-slate-800 px-3 py-2 rounded-xl rounded-bl-sm max-w-[95%]'
                    }
                  >
                    {m.texto}
                  </div>
                  {m.sugerencias && m.sugerencias.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.sugerencias.map(f => (
                        <button
                          key={f.pregunta}
                          onClick={() => responder(f.pregunta, f)}
                          className="text-xs px-2.5 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          {f.pregunta}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={fin} />
            </div>

            <form onSubmit={enviar} className="p-3 border-t border-slate-200 flex gap-2">
              <input
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribe tu duda…"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
              />
              <button
                type="submit"
                disabled={!texto.trim()}
                className="px-3 py-2 bg-brand-blue text-white rounded-lg disabled:opacity-50"
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
