import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { FileText, Truck, Search, ShieldCheck } from 'lucide-react';
import { useGarantias } from './hooks/useGarantias';
import Registro from './screens/Registro';
import Embarque from './screens/Embarque';
import Consulta from './screens/Consulta';

import { Logo } from './components/Logo';

type Screen = 'registro' | 'embarque' | 'consulta';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registro');
  const { registrarGarantia, actualizarEstatus, buscarPorFolio, obtenerSiguienteFolio } = useGarantias();

  const navItems = [
    { id: 'registro', label: 'Registro', icon: FileText },
    { id: 'embarque', label: 'Embarque', icon: Truck },
    { id: 'consulta', label: 'Consulta', icon: Search },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header & Navigation */}
      <header className="bg-brand-blue border-b border-brand-blue-light sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <Logo className="h-12 w-auto drop-shadow-sm" />
              <h1 className="text-lg font-medium text-white/90 hidden md:block border-l border-white/20 pl-4 ml-2">
                Gestor de Garantías
              </h1>
            </div>
            
            <nav className="flex bg-brand-blue-light/30 p-1.5 rounded-xl backdrop-blur-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-white text-brand-blue shadow-sm' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentScreen === 'registro' && (
            <Registro key="registro" onRegistrar={registrarGarantia} onObtenerSiguienteFolio={obtenerSiguienteFolio} />
          )}
          {currentScreen === 'embarque' && (
            <Embarque key="embarque" onBuscar={buscarPorFolio} onActualizar={actualizarEstatus} />
          )}
          {currentScreen === 'consulta' && (
            <Consulta key="consulta" onBuscar={buscarPorFolio} onActualizar={actualizarEstatus} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
