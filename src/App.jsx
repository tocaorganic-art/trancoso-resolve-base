import './App.css'
import { useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/contexts/AppContext'
import { queryClientInstance } from '@/lib/query-client'
import { reportWebVitals, measurePageLoad } from '@/lib/performance'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import AndroidBackHandler from '@/components/android/AndroidBackHandler'
import AndroidBottomTabsPreserver from '@/components/android/AndroidBottomTabsPreserver'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
// Páginas carregadas sob demanda (code-splitting) para reduzir o bundle inicial.
const FilaVerificacaoPage = lazy(() => import('@/pages/FilaVerificacao'));
const AdminPagamentosPage = lazy(() => import('@/pages/AdminPagamentos'));
const PreLancamentoPage = lazy(() => import('@/pages/PreLancamento'));
const AdminAntecedentesPage = lazy(() => import('@/pages/AdminAntecedentes'));
const ServicoLandingPage = lazy(() => import('@/pages/ServicoLanding'));
const SolicitacaoConfirmadaPage = lazy(() => import('@/pages/SolicitacaoConfirmada'));
const AboutPage = lazy(() => import('@/pages/About'));
const ContactPage = lazy(() => import('@/pages/Contact'));
const VerificacaoDocumentoPage = lazy(() => import('@/pages/VerificacaoDocumento'));
const VerificacaoAntecedentesPage = lazy(() => import('@/pages/VerificacaoAntecedentes'));
const PoliticaDevolucoesPage = lazy(() => import('@/pages/PoliticaDevolucoes'));
const TermosDeServicoPage = lazy(() => import('@/pages/TermosDeServico'));
const AssinaturaConfirmadaPage = lazy(() => import('@/pages/AssinaturaConfirmada'));
const SeoDashboard = lazy(() => import('@/pages/admin/SeoDashboard'));
const ConfiguracaoMarketing = lazy(() => import('@/pages/admin/ConfiguracaoMarketing'));
const DiaristaTrancoso = lazy(() => import('@/pages/servicos/DiaristaTrancoso'));
const AdminMetricasPage = lazy(() => import('@/pages/AdminMetricas'));
const EletricistaTrancoso = lazy(() => import('@/pages/servicos/EletricistaTrancoso'));
const PiscineiroTrancoso = lazy(() => import('@/pages/servicos/PiscineiroTrancoso'));
const PedreiroTrancoso = lazy(() => import('@/pages/servicos/PedreiroTrancoso'));
const PintorTrancoso = lazy(() => import('@/pages/servicos/PintorTrancoso'));
const JardineiroTrancoso = lazy(() => import('@/pages/servicos/JardineiroTrancoso'));
const EncanadorTrancoso = lazy(() => import('@/pages/servicos/EncanadorTrancoso'));
const ChefTrancoso = lazy(() => import('@/pages/servicos/ChefTrancoso'));
const SegurancaTrancoso = lazy(() => import('@/pages/servicos/SegurancaTrancoso'));
const MotoristaTrancoso = lazy(() => import('@/pages/servicos/MotoristaTrancoso'));
const QuadradoTrancoso = lazy(() => import('@/pages/servicos/QuadradoTrancoso'));
const RioVerdeTrancoso = lazy(() => import('@/pages/servicos/RioVerdeTrancoso'));
const PitingaTrancoso = lazy(() => import('@/pages/servicos/PitingaTrancoso'));
const DiaristaPortoSeguro = lazy(() => import('@/pages/servicos/DiaristaPortoSeguro'));
const EletricistaPortoSeguro = lazy(() => import('@/pages/servicos/EletricistaPortoSeguro'));
const PiscineiroPortoSeguro = lazy(() => import('@/pages/servicos/PiscineiroPortoSeguro'));
const CozinheiroPortoSeguro = lazy(() => import('@/pages/servicos/CozinheiroPortoSeguro'));
const JardineiroPortoSeguro = lazy(() => import('@/pages/servicos/JardineiroPortoSeguro'));
const PedreiroPortoSeguro = lazy(() => import('@/pages/servicos/PedreiroPortoSeguro'));
const DiaristaCaraiva = lazy(() => import('@/pages/servicos/DiaristaCaraiva'));
const EletricistaCaraiva = lazy(() => import('@/pages/servicos/EletricistaCaraiva'));
const PiscineiroCaraiva = lazy(() => import('@/pages/servicos/PiscineiroCaraiva'));
const CozinheiroCaraiva = lazy(() => import('@/pages/servicos/CozinheiroCaraiva'));
const JardineiroCaraiva = lazy(() => import('@/pages/servicos/JardineiroCaraiva'));
const PedreiroCaraiva = lazy(() => import('@/pages/servicos/PedreiroCaraiva'));
const RelatorioDiarioPage = lazy(() => import('@/pages/RelatorioDiarioPage'));
const ServicosCategoria = lazy(() => import('@/pages/ServicosCategoria'));
const DestinoTrancoso = lazy(() => import('@/pages/destinos/Trancoso'));
const DestinoArraialDajuda = lazy(() => import('@/pages/destinos/ArraialDajuda'));
const DestinoPortoSeguro = lazy(() => import('@/pages/destinos/PortoSeguro'));
const DestinoCaraiva = lazy(() => import('@/pages/destinos/Caraiva'));
const TocaTrIAPage = lazy(() => import('@/pages/Assistentevirtual'));
const DestinoHub = lazy(() => import('@/pages/DestinoHub'));
const ServicoDestino = lazy(() => import('@/pages/ServicoDestino'));
const DJTrancoso = lazy(() => import('@/pages/servicos/DJTrancoso'));
const CasamentoTrancoso = lazy(() => import('@/pages/destinos/CasamentoTrancoso'));
const RevelionTrancoso = lazy(() => import('@/pages/destinos/RevelionTrancoso'));
const DiaristaArraialDajuda = lazy(() => import('@/pages/servicos/DiaristaArraialDajuda'));
const EletricistaArraialDajuda = lazy(() => import('@/pages/servicos/EletricistaArraialDajuda'));
const PiscineiroArraialDajuda = lazy(() => import('@/pages/servicos/PiscineiroArraialDajuda'));
const CozinheiroArraialDajuda = lazy(() => import('@/pages/servicos/CozinheiroArraialDajuda'));
const JardineiroArraialDajuda = lazy(() => import('@/pages/servicos/JardineiroArraialDajuda'));
const PedreiroArraialDajuda = lazy(() => import('@/pages/servicos/PedreiroArraialDajuda'));
const MorarTrancoso = lazy(() => import('@/pages/guides/MorarTrancoso'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
<Layout currentPageName={currentPageName}>{children}</Layout>
: <>{children}</>;

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18, ease: 'easeIn' } },
};

const AnimatedPage = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

// Fallback exibido enquanto um chunk de rota (lazy) é carregado.
const RouteFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-[#E8571A] rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#E8571A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <LayoutWrapper currentPageName={mainPageKey}>
              <AnimatedPage><MainPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <AnimatedPage><Page /></AnimatedPage>
                </LayoutWrapper>
              }
            />
          ))}
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/FilaVerificacao" element={
              <LayoutWrapper currentPageName="FilaVerificacao">
                <AnimatedPage><FilaVerificacaoPage /></AnimatedPage>
              </LayoutWrapper>
            } />
            <Route path="/AdminPagamentos" element={
              <LayoutWrapper currentPageName="AdminPagamentos">
                <AnimatedPage><AdminPagamentosPage /></AnimatedPage>
              </LayoutWrapper>
            } />
            <Route path="/AdminAntecedentes" element={
              <LayoutWrapper currentPageName="AdminAntecedentes">
                <AnimatedPage><AdminAntecedentesPage /></AnimatedPage>
              </LayoutWrapper>
            } />
          </Route>
          <Route path="/PreLancamento" element={
            <AnimatedPage><PreLancamentoPage /></AnimatedPage>
          } />

          <Route path="/ServicoLanding" element={
            <LayoutWrapper currentPageName="ServicoLanding">
              <AnimatedPage><ServicoLandingPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/SolicitacaoConfirmada" element={
            <LayoutWrapper currentPageName="SolicitacaoConfirmada">
              <AnimatedPage><SolicitacaoConfirmadaPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/About" element={
            <LayoutWrapper currentPageName="About">
              <AnimatedPage><AboutPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/Contact" element={
            <LayoutWrapper currentPageName="Contact">
              <AnimatedPage><ContactPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/Assistentevirtual" element={
              <AnimatedPage><TocaTrIAPage /></AnimatedPage>
            } />
          </Route>
          <Route path="/VerificacaoDocumento" element={
            <LayoutWrapper currentPageName="VerificacaoDocumento">
              <AnimatedPage><VerificacaoDocumentoPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/VerificacaoAntecedentes" element={
            <LayoutWrapper currentPageName="VerificacaoAntecedentes">
              <AnimatedPage><VerificacaoAntecedentesPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/PoliticaDevolucoes" element={
            <LayoutWrapper currentPageName="PoliticaDevolucoes">
              <AnimatedPage><PoliticaDevolucoesPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/TermosDeServico" element={
            <LayoutWrapper currentPageName="TermosDeServico">
              <AnimatedPage><TermosDeServicoPage /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/AssinaturaConfirmada" element={
            <AnimatedPage><AssinaturaConfirmadaPage /></AnimatedPage>
          } />
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/admin/seo" element={
              <AnimatedPage><SeoDashboard /></AnimatedPage>
            } />
            <Route path="/admin/marketing" element={
              <AnimatedPage><ConfiguracaoMarketing /></AnimatedPage>
            } />
            <Route path="/admin/metricas" element={
              <LayoutWrapper currentPageName="AdminMetricas">
                <AnimatedPage><AdminMetricasPage /></AnimatedPage>
              </LayoutWrapper>
            } />
          </Route>
          <Route path="/servicos/diarista-trancoso" element={
            <LayoutWrapper currentPageName="DiaristaTrancoso">
              <AnimatedPage><DiaristaTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/eletricista-trancoso" element={
            <LayoutWrapper currentPageName="EletricistaTrancoso">
              <AnimatedPage><EletricistaTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/piscineiro-trancoso" element={
            <LayoutWrapper currentPageName="PiscineiroTrancoso">
              <AnimatedPage><PiscineiroTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pedreiro-trancoso" element={
            <LayoutWrapper currentPageName="PedreiroTrancoso">
              <AnimatedPage><PedreiroTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pintor-trancoso" element={
            <LayoutWrapper currentPageName="PintorTrancoso">
              <AnimatedPage><PintorTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/jardineiro-trancoso" element={
            <LayoutWrapper currentPageName="JardineiroTrancoso">
              <AnimatedPage><JardineiroTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/encanador-trancoso" element={
            <LayoutWrapper currentPageName="EncanadorTrancoso">
              <AnimatedPage><EncanadorTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/chef-trancoso" element={
            <LayoutWrapper currentPageName="ChefTrancoso">
              <AnimatedPage><ChefTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/seguranca-trancoso" element={
            <LayoutWrapper currentPageName="SegurancaTrancoso">
              <AnimatedPage><SegurancaTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/motorista-trancoso" element={
            <LayoutWrapper currentPageName="MotoristaTrancoso">
              <AnimatedPage><MotoristaTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/quadrado-trancoso" element={
            <LayoutWrapper currentPageName="QuadradoTrancoso">
              <AnimatedPage><QuadradoTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/rio-verde-trancoso" element={
            <LayoutWrapper currentPageName="RioVerdeTrancoso">
              <AnimatedPage><RioVerdeTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pitinga-trancoso" element={
            <LayoutWrapper currentPageName="PitingaTrancoso">
              <AnimatedPage><PitingaTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/diarista-porto-seguro" element={
            <LayoutWrapper currentPageName="DiaristaPortoSeguro">
              <AnimatedPage><DiaristaPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/eletricista-porto-seguro" element={
            <LayoutWrapper currentPageName="EletricistaPortoSeguro">
              <AnimatedPage><EletricistaPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/piscineiro-porto-seguro" element={
            <LayoutWrapper currentPageName="PiscineiroPortoSeguro">
              <AnimatedPage><PiscineiroPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/cozinheiro-porto-seguro" element={
            <LayoutWrapper currentPageName="CozinheiroPortoSeguro">
              <AnimatedPage><CozinheiroPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/jardineiro-porto-seguro" element={
            <LayoutWrapper currentPageName="JardineiroPortoSeguro">
              <AnimatedPage><JardineiroPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pedreiro-porto-seguro" element={
            <LayoutWrapper currentPageName="PedreiroPortoSeguro">
              <AnimatedPage><PedreiroPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/diarista-caraiva" element={
            <LayoutWrapper currentPageName="DiaristaCaraiva">
              <AnimatedPage><DiaristaCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/eletricista-caraiva" element={
            <LayoutWrapper currentPageName="EletricistaCaraiva">
              <AnimatedPage><EletricistaCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/piscineiro-caraiva" element={
            <LayoutWrapper currentPageName="PiscineiroCaraiva">
              <AnimatedPage><PiscineiroCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/cozinheiro-caraiva" element={
            <LayoutWrapper currentPageName="CozinheiroCaraiva">
              <AnimatedPage><CozinheiroCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/jardineiro-caraiva" element={
            <LayoutWrapper currentPageName="JardineiroCaraiva">
              <AnimatedPage><JardineiroCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pedreiro-caraiva" element={
            <LayoutWrapper currentPageName="PedreiroCaraiva">
              <AnimatedPage><PedreiroCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />


          {/* Serviços Arraial d'Ajuda */}
          <Route path="/servicos/diarista-arraial-dajuda" element={
            <LayoutWrapper currentPageName="DiaristaArraialDajuda">
              <AnimatedPage><DiaristaArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/eletricista-arraial-dajuda" element={
            <LayoutWrapper currentPageName="EletricistaArraialDajuda">
              <AnimatedPage><EletricistaArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/piscineiro-arraial-dajuda" element={
            <LayoutWrapper currentPageName="PiscineiroArraialDajuda">
              <AnimatedPage><PiscineiroArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/cozinheiro-arraial-dajuda" element={
            <LayoutWrapper currentPageName="CozinheiroArraialDajuda">
              <AnimatedPage><CozinheiroArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/jardineiro-arraial-dajuda" element={
            <LayoutWrapper currentPageName="JardineiroArraialDajuda">
              <AnimatedPage><JardineiroArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/servicos/pedreiro-arraial-dajuda" element={
            <LayoutWrapper currentPageName="PedreiroArraialDajuda">
              <AnimatedPage><PedreiroArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />

          {/* Guide: Morar em Trancoso */}
          <Route path="/guides/morar-em-trancoso" element={
            <LayoutWrapper currentPageName="MorarTrancoso">
              <AnimatedPage><MorarTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />

          {/* Novas páginas: DJ, Casamento, Réveillon */}
          <Route path="/servicos/dj-trancoso" element={
            <LayoutWrapper currentPageName="DJTrancoso">
              <AnimatedPage><DJTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/destinos/casamento-trancoso" element={
            <LayoutWrapper currentPageName="CasamentoTrancoso">
              <AnimatedPage><CasamentoTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/destinos/reveillon-trancoso" element={
            <LayoutWrapper currentPageName="RevelionTrancoso">
              <AnimatedPage><RevelionTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />

          {/* URLs limpas por destino */}
          <Route path="/trancoso" element={
            <LayoutWrapper currentPageName="DestinoTrancoso">
              <AnimatedPage><DestinoTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/arraial-dajuda" element={
            <LayoutWrapper currentPageName="DestinoArraialDajuda">
              <AnimatedPage><DestinoArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/porto-seguro" element={
            <LayoutWrapper currentPageName="DestinoPortoSeguro">
              <AnimatedPage><DestinoPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/caraiva" element={
            <LayoutWrapper currentPageName="DestinoCaraiva">
              <AnimatedPage><DestinoCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />

          {/* Aliases com hífen → redirect para CamelCase */}
          <Route path="/como-funciona" element={<Navigate to="/ComoFunciona" replace />} />
          <Route path="/seja-prestador" element={<Navigate to="/SejaPrestador" replace />} />
          <Route path="/servicos" element={<Navigate to="/ServicosCategoria" replace />} />
          <Route path="/Servicos" element={<Navigate to="/ServicosCategoria" replace />} />
          <Route path="/sobre" element={<Navigate to="/About" replace />} />
          <Route path="/contato" element={<Navigate to="/Contact" replace />} />
          <Route path="/planos" element={<Navigate to="/Planos" replace />} />
          <Route path="/politica-privacidade" element={<Navigate to="/PoliticaPrivacidade" replace />} />

          {/* Aliases CamelCase → slugs canônicos com hífen (BUG #2) */}
          <Route path="/Trancoso" element={<Navigate to="/trancoso" replace />} />
          <Route path="/PortoSeguro" element={<Navigate to="/porto-seguro" replace />} />
          <Route path="/Caraiva" element={<Navigate to="/caraiva" replace />} />
          <Route path="/ArraialdAjuda" element={<Navigate to="/arraial-dajuda" replace />} />
          <Route path="/ArraialDAjuda" element={<Navigate to="/arraial-dajuda" replace />} />
          <Route path="/ArraialDajuda" element={<Navigate to="/arraial-dajuda" replace />} />

          {/* Aliases sem barra para garantir acesso em hosting estático */}
          <Route path="/servicos-diarista-trancoso" element={<LayoutWrapper currentPageName="DiaristaTrancoso"><AnimatedPage><DiaristaTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-eletricista-trancoso" element={<LayoutWrapper currentPageName="EletricistaTrancoso"><AnimatedPage><EletricistaTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-piscineiro-trancoso" element={<LayoutWrapper currentPageName="PiscineiroTrancoso"><AnimatedPage><PiscineiroTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-pedreiro-trancoso" element={<LayoutWrapper currentPageName="PedreiroTrancoso"><AnimatedPage><PedreiroTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-pintor-trancoso" element={<LayoutWrapper currentPageName="PintorTrancoso"><AnimatedPage><PintorTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-jardineiro-trancoso" element={<LayoutWrapper currentPageName="JardineiroTrancoso"><AnimatedPage><JardineiroTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-encanador-trancoso" element={<LayoutWrapper currentPageName="EncanadorTrancoso"><AnimatedPage><EncanadorTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-chef-trancoso" element={<LayoutWrapper currentPageName="ChefTrancoso"><AnimatedPage><ChefTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-seguranca-trancoso" element={<LayoutWrapper currentPageName="SegurancaTrancoso"><AnimatedPage><SegurancaTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-motorista-trancoso" element={<LayoutWrapper currentPageName="MotoristaTrancoso"><AnimatedPage><MotoristaTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-quadrado-trancoso" element={<LayoutWrapper currentPageName="QuadradoTrancoso"><AnimatedPage><QuadradoTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-rio-verde-trancoso" element={<LayoutWrapper currentPageName="RioVerdeTrancoso"><AnimatedPage><RioVerdeTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-pitinga-trancoso" element={<LayoutWrapper currentPageName="PitingaTrancoso"><AnimatedPage><PitingaTrancoso /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-diarista-porto-seguro" element={<LayoutWrapper currentPageName="DiaristaPortoSeguro"><AnimatedPage><DiaristaPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-eletricista-porto-seguro" element={<LayoutWrapper currentPageName="EletricistaPortoSeguro"><AnimatedPage><EletricistaPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-piscineiro-porto-seguro" element={<LayoutWrapper currentPageName="PiscineiroPortoSeguro"><AnimatedPage><PiscineiroPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-cozinheiro-porto-seguro" element={<LayoutWrapper currentPageName="CozinheiroPortoSeguro"><AnimatedPage><CozinheiroPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-jardineiro-porto-seguro" element={<LayoutWrapper currentPageName="JardineiroPortoSeguro"><AnimatedPage><JardineiroPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-pedreiro-porto-seguro" element={<LayoutWrapper currentPageName="PedreiroPortoSeguro"><AnimatedPage><PedreiroPortoSeguro /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-diarista-caraiva" element={<LayoutWrapper currentPageName="DiaristaCaraiva"><AnimatedPage><DiaristaCaraiva /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-eletricista-caraiva" element={<LayoutWrapper currentPageName="EletricistaCaraiva"><AnimatedPage><EletricistaCaraiva /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-piscineiro-caraiva" element={<LayoutWrapper currentPageName="PiscineiroCaraiva"><AnimatedPage><PiscineiroCaraiva /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-cozinheiro-caraiva" element={<LayoutWrapper currentPageName="CozinheiroCaraiva"><AnimatedPage><CozinheiroCaraiva /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-jardineiro-caraiva" element={<LayoutWrapper currentPageName="JardineiroCaraiva"><AnimatedPage><JardineiroCaraiva /></AnimatedPage></LayoutWrapper>} />
          <Route path="/servicos-pedreiro-caraiva" element={<LayoutWrapper currentPageName="PedreiroCaraiva"><AnimatedPage><PedreiroCaraiva /></AnimatedPage></LayoutWrapper>} />

          <Route path="/destinos/trancoso" element={
            <LayoutWrapper currentPageName="DestinoTrancoso">
              <AnimatedPage><DestinoTrancoso /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/destinos/arraial-dajuda" element={
            <LayoutWrapper currentPageName="DestinoArraialDajuda">
              <AnimatedPage><DestinoArraialDajuda /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/destinos/porto-seguro" element={
            <LayoutWrapper currentPageName="DestinoPortoSeguro">
              <AnimatedPage><DestinoPortoSeguro /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/destinos/caraiva" element={
            <LayoutWrapper currentPageName="DestinoCaraiva">
              <AnimatedPage><DestinoCaraiva /></AnimatedPage>
            </LayoutWrapper>
          } />

          <Route path="/RelatorioDiario" element={
            <AnimatedPage><RelatorioDiarioPage /></AnimatedPage>
          } />
          <Route path="/ServicosCategoria" element={
            <LayoutWrapper currentPageName="ServicosCategoria">
              <AnimatedPage><ServicosCategoria /></AnimatedPage>
            </LayoutWrapper>
          } />

          {/* Hubs de destino e páginas categoria × destino — devem vir antes do catch-all */}
          <Route path="/:destino/:categoria" element={
            <LayoutWrapper currentPageName="ServicoDestino">
              <AnimatedPage><ServicoDestino /></AnimatedPage>
            </LayoutWrapper>
          } />
          <Route path="/:destino" element={
            <LayoutWrapper currentPageName="DestinoHub">
              <AnimatedPage><DestinoHub /></AnimatedPage>
            </LayoutWrapper>
          } />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    reportWebVitals();
    measurePageLoad();
  }, []);

  return (
    <AppProvider>
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <NavigationTracker />
              <AndroidBackHandler />
              <AndroidBottomTabsPreserver />
              <AuthenticatedApp />
              <Analytics />
              <SpeedInsights />
            </Router>
            <Toaster />
            {import.meta.env.DEV && <VisualEditAgent />}
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </AppProvider>
  )
}

export default App
