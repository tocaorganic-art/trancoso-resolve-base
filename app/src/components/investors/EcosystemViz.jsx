/**
 * EcosystemViz
 * Nós interativos do ecossistema Trancoso Resolve.
 *
 * Desktop: SVG com nós ao redor do hub central.
 *   - hover → destaca nó, opaca os demais, exibe card de valor
 * Mobile: grid de cards com toque
 * prefers-reduced-motion: sem transições de opacidade, card sempre visível no toque
 *
 * Apenas categorias reais do produto.
 */
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const NODES = [
  {
    id: 'clientes',
    label: 'Clientes',
    emoji: '🏠',
    color: '#E8571A',
    angle: -90,
    value: 'Proprietários de villas, pousadas e moradores locais que precisam de serviços verificados e rápidos.',
  },
  {
    id: 'prestadores',
    label: 'Prestadores',
    emoji: '🔧',
    color: '#6B7C3A',
    angle: -30,
    value: 'Eletricistas, diaristas, piscineiros, chefs e mais de 20 categorias de profissionais verificados.',
  },
  {
    id: 'turismo',
    label: 'Turismo',
    emoji: '🌴',
    color: '#2D7D8A',
    angle: 30,
    value: 'Turistas e noivos que chegam em alta temporada e precisam de suporte local imediato.',
  },
  {
    id: 'eventos',
    label: 'Eventos',
    emoji: '🎊',
    color: '#9B59B6',
    angle: 90,
    value: 'Casamentos, eventos corporativos e festas que demandam múltiplos serviços coordenados.',
  },
  {
    id: 'empresas',
    label: 'Empresas',
    emoji: '🏢',
    color: '#E67E22',
    angle: 150,
    value: 'Pousadas, imobiliárias e negócios locais que terceirizam serviços recorrentes de manutenção.',
  },
  {
    id: 'parceiros',
    label: 'Parceiros',
    emoji: '🤝',
    color: '#1ABC9C',
    angle: 210,
    value: 'Associações, Sebrae e prefeitura — ecossistema de apoio ao desenvolvimento local.',
  },
];

const CX = 200, CY = 200, R = 140;

function polarToXY(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export default function EcosystemViz() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const [active, setActive] = useState(null);

  const activeNode = NODES.find(n => n.id === active);

  return (
    <div ref={ref} className="space-y-6">
      {/* Desktop SVG */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 items-center">
        <div aria-label="Ecossistema Trancoso Resolve — interativo" role="img">
          <svg viewBox="0 0 400 400" className="w-full max-w-sm mx-auto" aria-hidden="true">
            {/* Linhas de conexão */}
            {NODES.map((node, i) => {
              const pos = polarToXY(node.angle, R);
              const isActive = active === node.id;
              const isDimmed = active && !isActive;
              return (
                <motion.line
                  key={node.id}
                  x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                  stroke={node.color}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? '0' : '4 4'}
                  opacity={isDimmed ? (reduced ? 0.2 : 0.15) : 0.45}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? {
                    pathLength: 1,
                    opacity: isDimmed ? 0.15 : 0.45,
                  } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.08 }}
                  style={{ transition: reduced ? 'none' : 'opacity 0.3s' }}
                />
              );
            })}

            {/* Hub central */}
            <motion.circle
              cx={CX} cy={CY} r={38}
              fill="#E8571A" fillOpacity={0.12}
              stroke="#E8571A" strokeWidth={1.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: reduced ? 0 : 0.4 }}
            />
            <text x={CX} y={CY - 5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#E8571A">Trancoso</text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize={10} fontWeight={700} fill="#E8571A">Resolve</text>

            {/* Nós */}
            {NODES.map((node, i) => {
              const pos = polarToXY(node.angle, R);
              const isActive = active === node.id;
              const isDimmed = active && !isActive;
              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={inView ? { opacity: isDimmed ? (reduced ? 0.3 : 0.25) : 1, scale: isActive ? 1.12 : 1 } : {}}
                  transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.07 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActive(active === node.id ? null : node.id)}
                  onKeyDown={e => e.key === 'Enter' && setActive(active === node.id ? null : node.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                  aria-label={`${node.label}: ${node.value}`}
                >
                  <circle cx={pos.x} cy={pos.y} r={26} fill={node.color} fillOpacity={isActive ? 0.2 : 0.1} stroke={node.color} strokeWidth={isActive ? 2 : 1} />
                  <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={16} aria-hidden="true">{node.emoji}</text>
                  <text x={pos.x} y={pos.y + 42} textAnchor="middle" fontSize={10} fontWeight={600} fill="currentColor" className="text-foreground" aria-hidden="true">{node.label}</text>
                </motion.g>
              );
            })}
          </svg>
          <p className="text-center text-xs text-muted-foreground mt-2">Clique em um nó para ver detalhes</p>
        </div>

        {/* Card de detalhe */}
        <div className="min-h-[140px] flex items-center">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border-2 p-6 w-full"
              style={{ borderColor: activeNode.color }}
            >
              <p className="text-3xl mb-3" aria-hidden="true">{activeNode.emoji}</p>
              <h3 className="font-bold text-foreground text-lg mb-2">{activeNode.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{activeNode.value}</p>
            </motion.div>
          ) : (
            <p className="text-muted-foreground text-sm text-center w-full">
              Selecione um segmento para ver sua conexão com a plataforma.
            </p>
          )}
        </div>
      </div>

      {/* Mobile: cards sequenciais */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {NODES.map((node, i) => {
          const isActive = active === node.id;
          return (
            <motion.button
              key={node.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setActive(active === node.id ? null : node.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive ? 'border-2' : 'border-border'
              }`}
              style={isActive ? { borderColor: node.color } : {}}
              aria-pressed={isActive}
              aria-label={node.label}
            >
              <p className="text-2xl mb-1" aria-hidden="true">{node.emoji}</p>
              <p className="font-semibold text-foreground text-sm">{node.label}</p>
              {isActive && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{node.value}</p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* SR description */}
      <p className="sr-only">
        Ecossistema da Trancoso Resolve composto por: {NODES.map(n => `${n.label} — ${n.value}`).join('; ')}.
      </p>
    </div>
  );
}
