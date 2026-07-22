import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import {
  Home, Calendar, Briefcase, UserCog,
  TrendingUp, CreditCard, Menu, X, FileText, User, Bot, Rocket, Globe, ShieldCheck, Banknote, ArrowLeft, ListOrdered, ChevronDown, MapPin, Sun, Moon, Megaphone } from
"lucide-react";

import Logo from "./components/brand/Logo";
import RoutePreloader from "./components/optimization/RoutePreloader";
import ImagePreloader from "./components/optimization/ImagePreloader";
import PerformanceMonitor from "./components/optimization/PerformanceMonitor";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import ConnectionStatus from "./components/ConnectionStatus";
import CookieConsent from "./components/CookieConsent";
import OfflineIndicator from "./components/OfflineIndicator";
import SkipToContent from "./components/ui/SkipToContent";
import ErrorBoundary from "./components/ErrorBoundary";
import PageViewTracker from "./components/analytics/PageViewTracker";
import WebVitalsCollector from "./components/analytics/WebVitalsCollector";
import AccessLogger from "./components/auth/AccessLogger";
import { lazy, Suspense } from "react";
const SupportChat = lazy(() => import("./components/support/SupportChat"));
const FeedbackCollector = lazy(() => import("./components/feedback/FeedbackCollector"));
import BottomNav from "./components/BottomNav";
import ProFloatingButton from "./components/banners/ProFloatingButton";
import CompletarPerfilModal from "./components/auth/CompletarPerfilModal";
import PWAPrompt from "./components/optimization/PWAPrompt";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRoot = location.pathname === "/" || location.pathname === "/Home";
  const { theme, toggleTheme, lang, setLang, t, LANGUAGES } = useApp();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity
  });

  useEffect(() => {
    const pageTitles = {
      '/': 'Trancoso Resolve — Profissionais Verificados em Trancoso',
      '/Home': 'Trancoso Resolve — Profissionais Verificados em Trancoso',
      '/ServicosCategoria': 'Buscar Serviços - Trancoso Resolve',
      '/PrestadorPerfil': 'Perfil do Prestador - Trancoso Resolve',
      '/ServicoDetalhes': 'Detalhes do Serviço - Trancoso Resolve',
      '/Planos': 'Planos e Preços - Trancoso Resolve',
      '/Manual': 'Manual e FAQ - Trancoso Resolve',
      '/SejaPrestador': 'Seja um Prestador - Trancoso Resolve',
      '/ComoFunciona': 'Como Funciona - Trancoso Resolve',
      '/Seguranca': 'Segurança e Privacidade - Trancoso Resolve',
      '/MeusPedidos': 'Meus Pedidos - Trancoso Resolve',
      '/Dashboard': 'Dashboard - Trancoso Resolve',
      '/Financeiro': 'Portal Financeiro - Trancoso Resolve',
      '/Assistentevirtual': 'TryA — Assistente de IA da Trancoso Resolve',
      '/GeradorDeImagem': 'Gerador de Imagens IA - Trancoso Resolve',
      '/PoliticaPrivacidade': 'Política de Privacidade - Trancoso Resolve',
      '/MinhaAgenda': 'Minha Agenda - Trancoso Resolve',
      '/MeuPerfilPrestador': 'Meu Perfil de Prestador - Trancoso Resolve',
      '/MeusServicos': 'Meus Serviços - Trancoso Resolve',
      '/Chat': 'Minhas Conversas | Trancoso Resolve',
      '/About': 'Sobre Nós | Trancoso Resolve',
      '/Contact': 'Contato | Trancoso Resolve',
      '/Planos': 'Planos e Preços | Trancoso Resolve',
      '/SejaPrestador': 'Seja um Prestador | Trancoso Resolve',
      '/ComoFunciona': 'Como Funciona | Trancoso Resolve',
      '/Assistentevirtual': 'Assistente IA | Trancoso Resolve',
      '/login': 'Entrar | Trancoso Resolve',
      '/register': 'Cadastrar | Trancoso Resolve',
    };

    const pageDescriptions = {
      '/': 'Encontre diaristas, eletricistas, piscineiros, cozinheiros e mais em Trancoso, Porto Seguro e Caraíva. Profissionais verificados, avaliados e prontos para atender sua villa ou pousada na Costa do Descobrimento.',
      '/Home': 'Encontre diaristas, eletricistas, piscineiros, cozinheiros e mais em Trancoso, Porto Seguro e Caraíva. Profissionais verificados, avaliados e prontos para atender sua villa ou pousada na Costa do Descobrimento.',
      '/ServicosCategoria': 'Navegue por categorias e encontre o profissional que resolve seu problema em Trancoso.',
      '/PrestadorPerfil': 'Veja o perfil detalhado e avaliações dos profissionais verificados em Trancoso.',
      '/ServicoDetalhes': 'Conheça os detalhes de cada serviço e contrate com confiança em Trancoso.',
      '/About': 'Conheça a Trancoso Resolve, a plataforma que conecta quem precisa de serviço a profissionais verificados em Trancoso, Bahia.',
      '/Contact': 'Entre em contato com a Trancoso Resolve. Estamos aqui para ajudar clientes e prestadores de serviço em Trancoso, Bahia.',
      '/ComoFunciona': 'Veja como conectar sua necessidade ao profissional certo em Trancoso em 3 passos simples. Rápido, seguro e com profissionais verificados.',
      '/SejaPrestador': 'Cadastre-se como prestador de serviços em Trancoso e receba clientes verificados. Eletricista, diarista, piscineiro, cozinheiro — sua agenda cheia começa aqui.',
      '/Planos': 'Escolha o plano ideal para expandir seus serviços em Trancoso. Comece grátis e cresça com nossa plataforma de profissionais verificados.',
      '/Assistentevirtual': 'Converse com o TryA, o assistente inteligente da Trancoso Resolve. Encontre o profissional certo para sua necessidade em segundos.',
      '/login': 'Acesse sua conta na Trancoso Resolve para gerenciar pedidos, contratar serviços e conectar-se com profissionais verificados em Trancoso.',
      '/register': 'Crie sua conta gratuita na Trancoso Resolve e acesse os melhores profissionais verificados de Trancoso, Bahia.',
    };

    const currentPath = location.pathname === '/Home' ? '/' : location.pathname;
    const currentTitle = pageTitles[currentPath] || 'Trancoso Resolve';
    const currentDescription = pageDescriptions[currentPath] || 'A forma mais fácil de encontrar e contratar serviços de confiança em Trancoso, Bahia.';

    document.title = currentTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = currentDescription;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = currentTitle;

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = currentDescription;

  }, [location.pathname]);

  const ADMIN_WHITELIST = ['tocaorganic@gmail.com'];
  const isAdmin = user?.role === "admin" || ADMIN_WHITELIST.includes(user?.email);
  const [perfilModalFechado, setPerfilModalFechado] = useState(false);
  const precisaCompletarPerfil = !!user && !user.profile_completed && !user.phone && !location.pathname.includes('CadastroTipo') && location.pathname === '/' && !perfilModalFechado;

  const isPrestador = user?.user_type === 'prestador';
  const isLojista = user?.user_type === 'lojista';

  const adminNavItems = isAdmin ? [
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: Home },
    { name: "Minha Agenda", path: createPageUrl("MinhaAgenda"), icon: Calendar },
    { name: "Meus Serviços", path: createPageUrl("MeusServicos"), icon: Briefcase },
    { name: "Meu Perfil", path: createPageUrl("MeuPerfilPrestador"), icon: UserCog },
    { name: "Financeiro", path: createPageUrl("Financeiro"), icon: TrendingUp },
    { name: "Planos", path: createPageUrl("Planos"), icon: CreditCard },
    { name: "Verificações", path: "/FilaVerificacao", icon: ShieldCheck },
    { name: "Antecedentes", path: "/AdminAntecedentes", icon: ShieldCheck },
    { name: "Pagamentos", path: "/AdminPagamentos", icon: Banknote },
    { name: "📊 Métricas", path: "/admin/metricas", icon: TrendingUp },
    { name: "Deploy", path: createPageUrl("DeployDashboard"), icon: Rocket },
    { name: "Ver Site", path: "/", icon: Globe, clearLogin: true },
  ] : isPrestador ? [
    { name: "Início", path: createPageUrl("Dashboard"), icon: Home },
    { name: "Meus Serviços", path: createPageUrl("MeusServicos"), icon: Briefcase },
    { name: "Minha Agenda", path: createPageUrl("MinhaAgenda"), icon: Calendar },
    { name: "Meus Pedidos", path: createPageUrl("MeusPedidos"), icon: ListOrdered },
    { name: "Assistente IA", path: createPageUrl("Assistentevirtual"), icon: Bot },
    { name: "Meu Perfil", path: createPageUrl("MeuPerfilPrestador"), icon: UserCog },
    { name: "Ver Site", path: "/", icon: Globe, clearLogin: true },
  ] : isLojista ? [
    { name: "Início", path: "/", icon: Home },
    { name: "Meus Anúncios", path: createPageUrl("DashboardLojista"), icon: Megaphone },
    { name: "Meu Perfil", path: createPageUrl("DashboardLojista"), icon: UserCog },
    { name: "Ver Site", path: "/", icon: Globe, clearLogin: true },
  ] : [
    { name: "Início", path: "/", icon: Home },
    { name: "Serviços", path: createPageUrl("ServicosCategoria"), icon: Briefcase },
    { name: "Meus Pedidos", path: createPageUrl("MeusPedidos"), icon: ListOrdered },
    { name: "Assistente IA", path: createPageUrl("Assistentevirtual"), icon: Bot },
    { name: "Meu Perfil", path: createPageUrl("MeusPedidos"), icon: UserCog },
  ];


  const publicPages = ['/', '/Home', '/ServicosCategoria', '/PrestadorPerfil', '/ServicoDetalhes', '/MeusPedidos', '/PoliticaPrivacidade', '/Manual', '/SejaPrestador', '/ComoFunciona', '/Seguranca', '/Assistentevirtual', '/GeradorDeImagem', '/Chat', '/About', '/Contact', '/ServicoLanding', '/SolicitacaoConfirmada', '/Planos'];
  const isPublicPage = publicPages.some((page) => {
    const pagePath = page === '/Home' ? '/' : page;
    const currentLocationPath = location.pathname === '/Home' ? '/' : location.pathname;
    return currentLocationPath === pagePath || currentLocationPath === `${pagePath}/`;
  }) || location.pathname.startsWith('/servicos/') || location.pathname.startsWith('/destinos/');

  const isActive = (path) => location.pathname === path;

  // Layout público
  if (isPublicPage) {
    return (
      <ErrorBoundary>
        <SkipToContent />
        <RoutePreloader />
        <ImagePreloader />
        <PerformanceMonitor />
        <PageViewTracker />
        <WebVitalsCollector />
        <AccessLogger />

        <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
          <header role="banner">
          <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-warm-sm" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
            <div className="container mx-auto px-3 md:px-4 py-3 flex items-center justify-between gap-2">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 shrink-0 min-w-fit" data-testid="nav-logo-link">
                <Logo markClassName="h-12 w-12 md:h-14 md:w-14" textClassName="text-sm md:text-base hidden sm:flex" />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3 lg:gap-6 min-w-0 overflow-hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-orange-500 transition-colors focus:outline-none">
                      <MapPin className="w-4 h-4" /> {t('nav.destinos')} <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuLabel>{t('nav.cities')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/destinos/trancoso"><MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />Trancoso</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/destinos/arraial-dajuda"><MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />Arraial d'Ajuda</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/destinos/porto-seguro"><MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />Porto Seguro</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/destinos/caraiva"><MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />Caraíva</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {user ? (
                  <>
                    <Link to={createPageUrl("ServicosCategoria")} className="text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">{t('nav.services')}</Link>
                    <Link to={createPageUrl("MeusPedidos")} className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">
                      <ListOrdered className="w-4 h-4" /> {t('nav.myOrders')}
                    </Link>
                    <Link to={createPageUrl("Assistentevirtual")} className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">
                      <Bot className="w-4 h-4" /> {t('nav.aiAssistant')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={createPageUrl("ComoFunciona")} className="text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">{t('nav.howItWorks')}</Link>
                    <Link to={createPageUrl("ServicosCategoria")} className="text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">{t('nav.services')}</Link>
                    <Link to={createPageUrl("SejaPrestador")} className="text-sm font-semibold text-foreground hover:text-orange-500 transition-colors">{t('nav.beProvider')}</Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 min-w-0 shrink">
                {/* Language selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-foreground gap-1 px-2 h-8 text-xs font-bold">
                      <Globe className="w-3.5 h-3.5" />
                      {lang.toUpperCase()}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {LANGUAGES.map(l => (
                      <DropdownMenuItem
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={cn("cursor-pointer text-sm", lang === l.code && "font-bold text-orange-500")}
                      >
                        {l.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-foreground" aria-label="Alternar tema">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {user ?
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-foreground min-w-0 max-w-[160px]" data-testid="user-menu-trigger">
                        <User className="w-5 h-5 shrink-0" />
                        <span className="truncate">{user.full_name || user.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('nav.myAccount')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.user_type === 'prestador' &&
                    <Link to={createPageUrl("Dashboard")}>
                          <DropdownMenuItem data-testid="user-menu-dashboard" className="cursor-pointer">{t('nav.dashboard')}</DropdownMenuItem>
                        </Link>
                    }
                      <Link to={createPageUrl("MeusPedidos")}>
                        <DropdownMenuItem className="cursor-pointer" data-testid="user-menu-meus-pedidos">
                          <FileText className="w-4 h-4 mr-2" />
                          {t('nav.myOrders')}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => base44.auth.logout()} className="cursor-pointer" data-testid="user-menu-logout">
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> :

                <Button onClick={() => {sessionStorage.setItem('loginTimestamp', Date.now().toString());base44.auth.redirectToLogin();}} className="bg-brand-primary text-white hover:bg-orange-600 transition-colors duration-200" size="sm" data-testid="login-button">
                    {t('nav.login')}
                  </Button>
                }
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={t('nav.openMenu')}>
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen &&
            <div className="md:hidden animate-fade-in pb-4 space-y-1 px-4 bg-card border-t border-border" data-testid="mobile-menu-content-public">
                <div className="py-2 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('nav.destinos')}</p>
                  <Link to="/destinos/trancoso" className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-2 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><MapPin className="w-4 h-4 text-orange-500" />Trancoso</Link>
                  <Link to="/destinos/arraial-dajuda" className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-2 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><MapPin className="w-4 h-4 text-orange-500" />Arraial d'Ajuda</Link>
                  <Link to="/destinos/porto-seguro" className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-2 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><MapPin className="w-4 h-4 text-orange-500" />Porto Seguro</Link>
                  <Link to="/destinos/caraiva" className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-2 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><MapPin className="w-4 h-4 text-orange-500" />Caraíva</Link>
                </div>
                {user ? (
                  <>
                    <Link to={createPageUrl("ServicosCategoria")} className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>{t('nav.services')}</Link>
                    <Link to={createPageUrl("MeusPedidos")} className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><ListOrdered className="w-4 h-4" /> {t('nav.myOrders')}</Link>
                    <Link to={createPageUrl("Assistentevirtual")} className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}><Bot className="w-4 h-4" /> {t('nav.aiAssistant')}</Link>
                    {user.user_type === 'prestador' && <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>}
                  </>
                ) : (
                  <>
                    <Link to={createPageUrl("ServicosCategoria")} className="block text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>{t('nav.services')}</Link>
                    <Link to={createPageUrl("ComoFunciona")} className="block text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>{t('nav.howItWorks')}</Link>
                    <Link to={createPageUrl("SejaPrestador")} className="block text-base font-semibold text-foreground hover:text-orange-500 py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>{t('nav.beProvider')}</Link>
                    <div className="pt-2 border-t border-border flex items-center gap-2">
                      <Button onClick={() => {setMobileMenuOpen(false);sessionStorage.setItem('loginTimestamp', Date.now().toString());base44.auth.redirectToLogin();}} className="flex-1 bg-brand-primary text-white hover:bg-orange-600 transition-colors duration-200 min-h-[44px]" size="sm">
                        {t('nav.login')}
                      </Button>
                      {/* Language + theme in mobile menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 px-2 text-xs font-bold h-11">
                            <Globe className="w-3.5 h-3.5" />{lang.toUpperCase()}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {LANGUAGES.map(l => (
                            <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className={cn("cursor-pointer text-sm", lang === l.code && "font-bold text-orange-500")}>
                              {l.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline" size="icon" onClick={toggleTheme} className="h-11 w-11" aria-label="Alternar tema">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            }
          </nav>
          </header>

          {/* Mobile-only top bar: logo on root, back button on sub-pages */}
          {isRoot &&
          <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border flex items-center px-3 h-12" style={{ paddingTop: "env(safe-area-inset-top, 0px)", top: "env(safe-area-inset-top, 0px)" }}>
            <Link to="/" className="flex items-center gap-2">
              <Logo markClassName="h-8 w-8" textClassName="text-xs" />
            </Link>
          </div>
          }
          {!isRoot &&
          <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border flex items-center px-3 h-12" style={{ paddingTop: "env(safe-area-inset-top, 0px)", top: "env(safe-area-inset-top, 0px)" }}>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-foreground min-w-[44px] min-h-[44px] -ml-1"
              aria-label={t('nav.back')}>
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t('nav.back')}</span>
            </button>
          </div>
          }

          <main id="main-content" className="flex-1 pb-24 md:pb-0 pt-12 md:pt-0">{children}</main>

          <footer className="text-white py-8 mt-8 pb-safe bg-[hsl(var(--card))]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}>
            <div className="container mx-auto px-4 text-center">
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                <Link to={createPageUrl("About")} className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center px-2">
                  {t('footer.about')}
                </Link>
                <Link to={createPageUrl("Contact")} className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center px-2">
                  {t('footer.contact')}
                </Link>
                <Link to={createPageUrl("PoliticaPrivacidade")} className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center px-2" data-testid="footer-privacy-link">
                  {t('footer.privacy')}
                </Link>
              </div>

              {/* Redes Sociais */}
              <div className="flex justify-center gap-5 mb-4">
                <a
                  href="https://www.instagram.com/trancosoresolve/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Trancoso Resolve"
                  className="text-slate-400 hover:text-pink-400 transition-colors">
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/1B7w8mmbMN/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook da Trancoso Resolve"
                  className="text-slate-400 hover:text-blue-400 transition-colors">
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/5573998283579"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp da Trancoso Resolve"
                  className="text-slate-400 hover:text-green-400 transition-colors">
                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>

              {/* Links de Destinos */}
              <div className="flex justify-center gap-x-5 gap-y-1 mb-3 flex-wrap text-sm">
                <Link to="/destinos/trancoso" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Trancoso</Link>
                <Link to="/destinos/arraial-dajuda" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Arraial d'Ajuda</Link>
                <Link to="/destinos/porto-seguro" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Porto Seguro</Link>
                <Link to="/destinos/caraiva" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Caraíva</Link>
              </div>

              {/* Links SEO Porto Seguro */}
              <div className="flex justify-center gap-x-4 gap-y-1 mb-4 flex-wrap text-xs text-slate-400">
                <span className="text-slate-500 font-semibold">Porto Seguro:</span>
                <Link to="/servicos/diarista-porto-seguro" className="hover:text-slate-200 transition-colors">Diarista</Link>
                <Link to="/servicos/eletricista-porto-seguro" className="hover:text-slate-200 transition-colors">Eletricista</Link>
                <Link to="/servicos/piscineiro-porto-seguro" className="hover:text-slate-200 transition-colors">Piscineiro</Link>
                <Link to="/servicos/cozinheiro-porto-seguro" className="hover:text-slate-200 transition-colors">Cozinheiro</Link>
                <Link to="/servicos/jardineiro-porto-seguro" className="hover:text-slate-200 transition-colors">Jardineiro</Link>
                <Link to="/servicos/pedreiro-porto-seguro" className="hover:text-slate-200 transition-colors">Pedreiro</Link>
              </div>

              <p className="text-muted-foreground text-base font-medium">
                {t('footer.copyright')}
              </p>
            </div>
          </footer>
          <Toaster />
          <ConnectionStatus />
          <OfflineIndicator />
          <CookieConsent />
        </div>
        <BottomNav />
        <ProFloatingButton />
        <Suspense fallback={null}><SupportChat /></Suspense>
        <Suspense fallback={null}><FeedbackCollector /></Suspense>
        <PWAPrompt />
        <CompletarPerfilModal user={user} open={precisaCompletarPerfil} onClose={() => setPerfilModalFechado(true)} />
      </ErrorBoundary>);

  }

  // Layout administrativo
  return (
    <ErrorBoundary>
      <SkipToContent />
      <RoutePreloader />
      <ImagePreloader />
      <PerformanceMonitor />
      <PageViewTracker />
      <AccessLogger />

      <div className="min-h-screen bg-background transition-colors">
        <nav className="bg-card border-b border-border shadow-warm-sm sticky top-0 z-50" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 shrink-0 min-w-fit" data-testid="admin-nav-logo-link">
                <Logo markClassName="h-10 w-10" textClassName="text-sm" />
              </Link>

              <div className="hidden lg:flex items-center gap-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => item.clearLogin && sessionStorage.removeItem('loginTimestamp')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.path) ?
                      'bg-orange-600 text-white' :
                      'text-slate-300 hover:bg-slate-700'}`
                      }
                      data-testid={`admin-nav-${item.name.toLowerCase().replace(' ', '-')}`}>
                      
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </Link>);

                })}
              </div>

              <div className="lg:hidden flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="mobile-menu-button"
                  aria-label="Abrir menu de navegação">
                  
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {mobileMenuOpen &&
            <div className="lg:hidden mt-4 pb-4 space-y-2" data-testid="mobile-menu-content">
                {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => {setMobileMenuOpen(false);item.clearLogin && sessionStorage.removeItem('loginTimestamp');}}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive(item.path) ?
                    'bg-orange-600 text-white' :
                    'text-slate-300 hover:bg-slate-700'}`
                    }
                    data-testid={`admin-mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}>
                    
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </Link>);

              })}
              </div>
            }
          </div>
        </nav>

        <main id="main-content" className="pb-12">
          {children}
        </main>
        <Toaster />
        <ConnectionStatus />
        <OfflineIndicator />
        <CookieConsent />
      </div>
      <Suspense fallback={null}><SupportChat /></Suspense>
      <Suspense fallback={null}><FeedbackCollector /></Suspense>
      <PWAPrompt />
    </ErrorBoundary>);

}