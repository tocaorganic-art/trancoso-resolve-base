import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { Home, LayoutGrid, Sparkles, Bot } from "lucide-react";

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

  const handleNavClick = (e, path) => {
    const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
    if (isActive) {
      e.preventDefault();
      navigate(path, { replace: true });
      window.scrollTo(0, 0);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border flex justify-around py-2"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)" }}
    >
      {navItems.map(({ key, path, icon: Icon }) => {
        const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        return (
          <Link
            key={path}
            to={path}
            onClick={(e) => handleNavClick(e, path)}
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
