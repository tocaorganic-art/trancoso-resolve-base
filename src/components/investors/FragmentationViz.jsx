/**
 * FragmentationViz
 * Animação conceitual: caos de mercado → plataforma central reorganiza.
 *
 * Desktop: SVG animado em 3 atos via Framer Motion.
 * Mobile: sequência vertical de cards estáticos.
 * prefers-reduced-motion: só o estado final (organizado) é exibido.
 *
 * Dados: apenas categorias reais do produto.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CLIENTS = [
  { id: 'c1', label: 'Proprietário de Villa', x: 60,  y: 60  },
  { id: 'c2', label: 'Pousada',              x: 60,  y: 160 },
  { id: 'c3', label: 'Morador Local',        x: 60,  y: 260 },
  { id: 'c4', label: 'Turista',              x: 60,  y: 360 },
];

const PROVIDERS = [
  { id: 'p1', label: 'Diarista',    x: 580, y: 60  },
  { id: 'p2', label: 'Eletricista', x: 580, y: 160 },
  { id: 'p3', label: 'Piscineiro',  x: 580, y: 260 },
  { id: 'p4', label: 'Chef',        x: 580, y: 360 },
];

const CENTER = { x: 320, y: 210 };

// Linhas caóticas (antes)
const CHAOS_LINES = [
  { from: 'c1', to: 'p3' }, { from: 'c1', to: 'p1' },
  { from: 'c2', to: 'p2' }, { from: 'c2', to: 'p4' },
  { from: 'c3', to: 'p1' }, { from: 'c3', to: 'p3' },
  { from: 'c4', to: 'p2' }, { from: 'c4', to: 'p4' },
  { from: 'c1', to: 'p4' }, { from: 'c3', to: 'p2' },
];

const allNodes = [...CLIENTS, ...PROVIDERS];
function nodeById(id) { return allNodes.find(n => n.id === id); }

function Node({ node, dim = false, label }) {
  const isClient = node.id.startsWith('c');
  return (
    <g>
      <circle
        cx={node.x} cy={node.y} r={20}
        fill={isClient ? '#E8571A' : '#6B7C3A'}
        opacity={dim ? 0.25 : 1}
        style={{ transition: 'opacity 0.4s' }}
      />
      <text
        x={isClient ? node.x - 28 : node.x + 28}
        y={node.y + 5}
        textAnchor={isClient ? 'end' : 'start'}
        fontSize={11} fontWeight={600}
        fill="currentColor"
        opacity={dim ? 0.25 : 1}
        style={{ transition: 'opacity 0.4s' }}
        className="text-foreground"
      >
        {label || node.label}
      </text>
    </g>
  );
}

// Linha de conexão animada
function AnimatedLine({ x1, y1, x2, y2, delay = 0, color = '#E8571A', opacity = 0.25 }) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.5}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    />
  );
}

// Ato 1: caos — linhas cruzadas desordenadas
function ActChaos() {
  return (
    <g>
      {CHAOS_LINES.map((l, i) => {
        const f = nodeById(l.from), t = nodeById(l.to);
        return <AnimatedLine key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} delay={i * 0.06} color="#E8571A" opacity={0.22} />;
      })}
      {CLIENTS.map(n => <Node key={n.id} node={n} />)}
      {PROVIDERS.map(n => <Node key={n.id} node={n} />)}
      {/* Pontos de atrito */}
      {[{x:200,y:130},{x:260,y:230},{x:360,y:170},{x:400,y:290}].map((pt,i)=>(
        <motion.text key={i} x={pt.x} y={pt.y} fontSize={16} textAnchor="middle"
          initial={{opacity:0,scale:0.5}} animate={{opacity:0.8,scale:1}}
          transition={{delay:0.8+i*0.1}}>⚡</motion.text>
      ))}
    </g>
  );
}

// Ato 2: plataforma central aparece
function ActPlatform() {
  return (
    <g>
      {CLIENTS.map(n => <Node key={n.id} node={n} />)}
      {PROVIDERS.map(n => <Node key={n.id} node={n} />)}
      <motion.circle cx={CENTER.x} cy={CENTER.y} r={44}
        fill="#E8571A" fillOpacity={0.12} stroke="#E8571A" strokeWidth={2}
        initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
        transition={{duration:0.5, ease:[0.22,1,0.36,1]}} />
      <motion.text x={CENTER.x} y={CENTER.y-4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#E8571A"
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>Trancoso</motion.text>
      <motion.text x={CENTER.x} y={CENTER.y+12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#E8571A"
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}>Resolve</motion.text>
    </g>
  );
}

// Ato 3: conexões organizadas convergem ao centro
function ActOrganized() {
  return (
    <g>
      {/* linhas clientes → centro */}
      {CLIENTS.map((n,i) => (
        <AnimatedLine key={n.id} x1={n.x} y1={n.y} x2={CENTER.x} y2={CENTER.y} delay={i*0.07} color="#E8571A" opacity={0.55} />
      ))}
      {/* linhas centro → prestadores */}
      {PROVIDERS.map((n,i) => (
        <AnimatedLine key={n.id} x1={CENTER.x} y1={CENTER.y} x2={n.x} y2={n.y} delay={0.3+i*0.07} color="#6B7C3A" opacity={0.55} />
      ))}
      {CLIENTS.map(n => <Node key={n.id} node={n} />)}
      {PROVIDERS.map(n => <Node key={n.id} node={n} />)}
      {/* Hub central */}
      <circle cx={CENTER.x} cy={CENTER.y} r={44} fill="#E8571A" fillOpacity={0.12} stroke="#E8571A" strokeWidth={2} />
      <text x={CENTER.x} y={CENTER.y-4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#E8571A">Trancoso</text>
      <text x={CENTER.x} y={CENTER.y+12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#E8571A">Resolve</text>
      {/* Tags de valor */}
      {['conexão','curadoria','confiança'].map((tag,i)=>(
        <motion.text key={tag} x={CENTER.x + (i-1)*90} y={CENTER.y+68}
          textAnchor="middle" fontSize={10} fontWeight={600}
          fill="#6B7C3A" opacity={0}
          animate={{opacity:0.9}} transition={{delay:0.6+i*0.12}}>
          ✓ {tag}
        </motion.text>
      ))}
    </g>
  );
}

// Versão mobile — cards verticais
function MobileCards({ reduced }) {
  const stages = [
    { emoji:'⚡', label:'Mercado fragmentado', desc:'Clientes e prestadores sem canal de confiança entre eles.' },
    { emoji:'🔍', label:'Difícil encontrar', desc:'Sem verificação, avaliações nem histórico — só indicação boca a boca.' },
    { emoji:'✅', label:'Trancoso Resolve', desc:'Plataforma central: curadoria, verificação, conexão e recorrência.' },
  ];
  return (
    <div className="flex flex-col gap-4">
      {stages.map((s, i) => (
        <motion.div key={s.label}
          initial={reduced ? {opacity:1} : {opacity:0, y:16}}
          whileInView={reduced ? {opacity:1} : {opacity:1, y:0}}
          viewport={{once:true}}
          transition={{delay: i*0.12, duration:0.45}}
          className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
          <div>
            <p className="font-bold text-foreground text-sm">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const ACTS = ['chaos', 'platform', 'organized'];
const ACT_DURATION = 2200; // ms por ato

export default function FragmentationViz() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const [act, setAct] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    if (act >= ACTS.length - 1) return;
    const t = setTimeout(() => setAct(a => Math.min(a + 1, ACTS.length - 1)), ACT_DURATION);
    return () => clearTimeout(t);
  }, [inView, act, reduced]);

  const ACT_LABELS = ['Situação atual — mercado fragmentado', 'Plataforma central emerge', 'Conexões organizadas e curadoria'];

  return (
    <div ref={ref} className="space-y-4">
      {/* Desktop */}
      <div className="hidden md:block" aria-label="Visualização: fragmentação do mercado → plataforma central" role="img">
        <p className="text-xs font-semibold text-muted-foreground mb-3 text-center" aria-live="polite">
          {ACT_LABELS[reduced ? 2 : act]}
        </p>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <svg viewBox="0 0 640 420" className="w-full" style={{maxHeight:320}} aria-hidden="true">
            <AnimatePresence mode="wait">
              {(reduced || act === 2) && <ActOrganized key="organized" />}
              {!reduced && act === 1 && <ActPlatform key="platform" />}
              {!reduced && act === 0 && <ActChaos key="chaos" />}
            </AnimatePresence>
          </svg>
        </div>
        {/* Indicador de atos */}
        {!reduced && (
          <div className="flex justify-center gap-2 mt-3" aria-hidden="true">
            {ACTS.map((a, i) => (
              <button key={a} onClick={() => setAct(i)}
                className={`h-1.5 rounded-full transition-all ${i === act ? 'w-8 bg-brand-primary' : 'w-2 bg-muted-foreground/30'}`}
                aria-label={ACT_LABELS[i]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileCards reduced={reduced} />
      </div>

      {/* Texto acessível (SR) */}
      <p className="sr-only">
        Visualização conceitual mostrando a transição de um mercado de serviços fragmentado
        (clientes e prestadores sem canal de confiança) para uma plataforma centralizada
        (Trancoso Resolve) que organiza, verifica e conecta ambos os lados.
      </p>
    </div>
  );
}
