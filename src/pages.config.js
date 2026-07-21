import { lazy } from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

// Home permanece eager (rota principal, crítica para LCP).
// Demais páginas são carregadas sob demanda (code-splitting) para reduzir o bundle inicial.
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Manual = lazy(() => import('./pages/Manual'));
const Planos = lazy(() => import('./pages/Planos'));
const AdminAssinaturas = lazy(() => import('./pages/AdminAssinaturas'));
const ServicosCategoria = lazy(() => import('./pages/ServicosCategoria'));
const PrestadorPerfil = lazy(() => import('./pages/PrestadorPerfil'));
const CadastroTipo = lazy(() => import('./pages/CadastroTipo'));
const MeuPerfilPrestador = lazy(() => import('./pages/MeuPerfilPrestador'));
const MinhaAgenda = lazy(() => import('./pages/MinhaAgenda'));
const MeusPedidos = lazy(() => import('./pages/MeusPedidos'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade'));
const SejaPrestador = lazy(() => import('./pages/SejaPrestador'));
const ComoFunciona = lazy(() => import('./pages/ComoFunciona'));
const Seguranca = lazy(() => import('./pages/Seguranca'));
const Assistentevirtual = lazy(() => import('./pages/Assistentevirtual'));
const GeradorDeImagem = lazy(() => import('./pages/GeradorDeImagem'));
const ServicoDetalhes = lazy(() => import('./pages/ServicoDetalhes'));
const MeusServicos = lazy(() => import('./pages/MeusServicos.jsx'));
const DiagnosticosCompletos = lazy(() => import('./pages/DiagnosticosCompletos'));
const ManutencaoSistema = lazy(() => import('./pages/ManutencaoSistema'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));
const AdminControleFinanceiro = lazy(() => import('./pages/AdminControleFinanceiro'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const Base44ReportViewer = lazy(() => import('./pages/Base44ReportViewer'));
const Base44Templates = lazy(() => import('./pages/Base44Templates'));
const DeployDashboard = lazy(() => import('./pages/DeployDashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const DashboardLojista = lazy(() => import('./pages/DashboardLojista'));


export const PAGES = {
    "Home": Home,
    "Financeiro": Financeiro,
    "Manual": Manual,
    "Planos": Planos,
    "AdminAssinaturas": AdminAssinaturas,
    "ServicosCategoria": ServicosCategoria,
    "PrestadorPerfil": PrestadorPerfil,
    "CadastroTipo": CadastroTipo,
    "MeuPerfilPrestador": MeuPerfilPrestador,
    "MinhaAgenda": MinhaAgenda,
    "MeusPedidos": MeusPedidos,
    "Dashboard": Dashboard,
    "PoliticaPrivacidade": PoliticaPrivacidade,
    "SejaPrestador": SejaPrestador,
    "ComoFunciona": ComoFunciona,
    "Seguranca": Seguranca,
    "Assistentevirtual": Assistentevirtual,
    "GeradorDeImagem": GeradorDeImagem,
    "ServicoDetalhes": ServicoDetalhes,
    "MeusServicos": MeusServicos,
    "DiagnosticosCompletos": DiagnosticosCompletos,
    "ManutencaoSistema": ManutencaoSistema,
    "MonitoringDashboard": MonitoringDashboard,
    "AdminControleFinanceiro": AdminControleFinanceiro,
    "AdminUserManagement": AdminUserManagement,
    "Base44ReportViewer": Base44ReportViewer,
    "Base44Templates": Base44Templates,
    "DeployDashboard": DeployDashboard,
    "Chat": Chat,
    "DashboardLojista": DashboardLojista,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
