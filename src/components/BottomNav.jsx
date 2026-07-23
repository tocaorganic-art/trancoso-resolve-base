import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { Home, LayoutGrid, Sparkles, Bot } from "lucide-react";

const TAB_HISTORY_KEY = "tr-tab-history";

const readTabHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(TAB_HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
};

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useApp();

  const navItems = [
    { key: 'home', path: "/", icon: Home },
    { key: 'categories', path: "/ServicosCategoria", icon: LayoutGrid },
    { key: 'ai', path: "/GeradorDeImagem", icon: Sparkles },
    { key: 'assistant', path: "/Assistentevirtual", icon: Bot },
  ];

  // Preserva a pilha de navegação por aba: memoriza a última sub-rota visitada
  useEffect(() => {
    const tab = navItems.find(({ path }) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)
    );
    if (tab) {
      const map = readTabHistory();
      map[tab.key] = location.pathname + location.search;
      sessionStorage.setItem(TAB_HISTORY_KEY, JSON.stringify(map));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const handleNavClick = (e, item) => {
    const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
    e.preventDefault();
    if (isActive) {
      // Toque na aba ativa: volta para a raiz da aba e rola ao topo
      navigate(item.path, { replace: true });
      window.scrollTo(0, 0);
    } else {
      // Toque em outra aba: restaura a última sub-rota visitada dessa aba
      const map = readTabHistory();
      navigate(map[item.key] || item.path);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border flex justify-around py-2"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)" }}
    >
      {navItems.map((item) => {
        const { key, path, icon: Icon } = item;
        const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        return (
          <Link
            key={path}
            to={path}
            onClick={(e) => handleNavClick(e, item)}
            className={cn(
              "select-none flex flex-col items-center gap-0.5 flex-1 py-2 px-1 transition-colors",
              isActive ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-tight">{t(`bottomNav.${key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}