import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Processes from "./pages/Processes";
import AIAssistant from "./pages/AIAssistant";
import Automation from "./pages/Automation";
import Notifications from "./pages/Notifications";
import DeveloperStates from "./pages/DeveloperStates";
import AdminUsers from "./pages/AdminUsers";
import AvatarSettings from "./pages/AvatarSettings";
import ProcessDetails from "./pages/ProcessDetails";
import CreateProcess from "./pages/CreateProcess";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import CalendarIntegration from "./pages/CalendarIntegration";
import ConversationHistory from "./pages/ConversationHistory";
import LawyerDashboard from "./pages/LawyerDashboard";
import Pipeline from "./pages/Pipeline";
import Financeiro from "./pages/Financeiro";
import AgendaJuridica from "./pages/AgendaJuridica";
import ControleProcessos from "./pages/ControleProcessos";
import ProcessoDashboard from "./pages/ProcessoDashboard";
import Analytics from "./pages/Analytics";
import DashboardLayout from "./components/DashboardLayout";
import { useAuth } from "./_core/hooks/useAuth";
import PublicHome from "./pages/public/PublicHome";
import PublicContato from "./pages/public/PublicContato";
import PublicSobre from "./pages/public/PublicSobre";
import PublicBlog from "./pages/public/PublicBlog";
import BlogPost from "./pages/public/BlogPost";
import BlogIndex from "./pages/admin/blog/BlogIndex";
import BlogCreate from "./pages/admin/blog/BlogCreate";
import DocsIndex from "./pages/admin/docs/DocsIndex";
import DocsUpload from "./pages/admin/docs/DocsUpload";
import DocsDetail from "./pages/admin/docs/DocsDetail";
import DocsVersions from "./pages/admin/docs/DocsVersions";
import TemplatesIndex from "./pages/admin/templates/TemplatesIndex";
import TemplatesCreate from "./pages/admin/templates/TemplatesCreate";
import TemplatesEdit from "./pages/admin/templates/TemplatesEdit";
import LandingIndenizacao from "./pages/public/LandingIndenizacao";
import LandingConsumidor from "./pages/public/LandingConsumidor";
import LandingContratos from "./pages/public/LandingContratos";
import LandingImobiliario from "./pages/public/LandingImobiliario";
import LandingEmpresarial from "./pages/public/LandingEmpresarial";
import LandingFamilia from "./pages/public/LandingFamilia";
import LandingPenal from "./pages/public/LandingPenal";
import LandingTributario from "./pages/public/LandingTributario";
import LandingTrabalhista from "./pages/public/LandingTrabalhista";
import LandingBancario from "./pages/public/LandingBancario";
import LandingConsultoriaJuridica from "./pages/public/LandingConsultoriaJuridica";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="w-16 h-16 rounded-full glass-strong mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="w-16 h-16 rounded-full glass-strong mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={PublicHome} />
      <Route path="/contato" component={PublicContato} />
      <Route path="/sobre" component={PublicSobre} />
      <Route path="/blog" component={PublicBlog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/landing/indenizacao" component={LandingIndenizacao} />
      <Route path="/landing/consumidor" component={LandingConsumidor} />
      <Route path="/landing/contratos" component={LandingContratos} />
      <Route path="/landing/imobiliario" component={LandingImobiliario} />
      <Route path="/landing/empresarial" component={LandingEmpresarial} />
      <Route path="/landing/familia" component={LandingFamilia} />
      <Route path="/landing/penal" component={LandingPenal} />
      <Route path="/landing/tributario" component={LandingTributario} />
      <Route path="/landing/trabalhista" component={LandingTrabalhista} />
      <Route path="/landing/bancario" component={LandingBancario} />
      <Route path="/landing/consultoria-juridica" component={LandingConsultoriaJuridica} />
      <Route path="/lead" component={PublicContato} />
      <Route path="/app" component={Home} />
      
      {/* Protected Routes with Dashboard Layout */}
      <Route path="/dashboard">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/processes">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Processes />
          </DashboardLayout>
        )} />
      </Route>
           <Route path="/processo/:id">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <ProcessoDashboard />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/analytics">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/notifications">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/developer/states">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <DeveloperStates />
          </DashboardLayout>
        )} />
      </Route>
      <Route path="/processes/new">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <CreateProcess />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/templates">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Templates />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/ai-assistant">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <AIAssistant />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/conversations">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <ConversationHistory />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/automation">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Automation />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/notifications">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/avatar-settings">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <AvatarSettings />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/calendar">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <CalendarIntegration />
          </DashboardLayout>
        )} />
      </Route>
      
      {/* Lawyer Dashboard (Núcleo 6) */}
      <Route path="/lawyer-dashboard">
        <ProtectedRoute component={LawyerDashboard} />
      </Route>
      
      <Route path="/pipeline">
        <ProtectedRoute component={Pipeline} />
      </Route>
      
      <Route path="/financeiro">
        <ProtectedRoute component={Financeiro} />
      </Route>
      
      <Route path="/agenda">
        <ProtectedRoute component={AgendaJuridica} />
      </Route>
      
      <Route path="/processos">
        <ProtectedRoute component={ControleProcessos} />
      </Route>
      
      <Route path="/processo/:id">
        <ProtectedRoute component={ProcessoDashboard} />
      </Route>
      
      {/* Admin Only Routes */}
      <Route path="/admin/users">
        <AdminRoute component={() => (
          <DashboardLayout>
            <AdminUsers />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/blog">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <BlogIndex />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/blog/create">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <BlogCreate />
          </DashboardLayout>
        )} />
      </Route>
      
      {/* Document Repository (Núcleo 18) */}
      <Route path="/admin/docs">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <DocsIndex />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/docs/upload">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <DocsUpload />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/docs/:id">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <DocsDetail />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/docs/versions/:id">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <DocsVersions />
          </DashboardLayout>
        )} />
      </Route>
      
      {/* Templates (Núcleo 18) */}
      <Route path="/admin/templates">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <TemplatesIndex />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/templates/create">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <TemplatesCreate />
          </DashboardLayout>
        )} />
      </Route>
      
      <Route path="/admin/templates/edit/:id">
        <ProtectedRoute component={() => (
          <DashboardLayout>
            <TemplatesEdit />
          </DashboardLayout>
        )} />
      </Route>
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
