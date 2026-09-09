import { Link } from "react-router-dom";

const BANNER_URL = "https://base44.app/api/apps/6a0754c82a7c1aae19211408/files/mp/public/6a0754c82a7c1aae19211408/e177725a5_banner_100vagas_1920x640.png";
const DESTINO = "/SejaPrestador";

export default function BannerLancamento() {
  return (
    <section className="w-full">
      <div className="relative hidden sm:block w-full overflow-hidden rounded-2xl shadow-lg">
        <Link to={DESTINO} aria-label="Cadastre-se: os 100 primeiros entram grátis">
          <img src={BANNER_URL} alt="Os 100 primeiros entram grátis — 30 dias na vitrine oficial de Trancoso sem pagar nada" className="w-full h-auto block" width={1920} height={640} loading="eager" />
        </Link>
        <Link to={DESTINO}
          className="absolute flex items-center justify-center rounded-full font-extrabold text-[#072E1A] bg-[#25D366] hover:bg-[#1fb85a] active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(37,211,102,0.45)] focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
          style={{ left: "50.6%", top: "69%", transform: "translateX(-50%)", width: "31%", height: "16%", fontSize: "clamp(13px, 1.25vw, 22px)", letterSpacing: "0.02em" }}>
          QUERO MINHA VAGA GRÁTIS
        </Link>
      </div>

      <div className="sm:hidden w-full overflow-hidden rounded-xl shadow-md">
        <Link to={DESTINO} aria-label="Cadastre-se: os 100 primeiros entram grátis">
          <img src={BANNER_URL} alt="Os 100 primeiros entram grátis — 30 dias na vitrine oficial de Trancoso" className="w-full h-auto block" loading="eager" />
        </Link>
        <div className="bg-[#0E1210] px-4 pt-4 pb-5 text-center">
          <p className="text-white font-extrabold text-lg leading-tight">OS 100 PRIMEIROS ENTRAM GRÁTIS</p>
          <p className="text-[#FFD600] font-semibold text-sm mt-1">30 dias na vitrine oficial sem pagar nada</p>
          <Link to={DESTINO} className="mt-4 flex w-full items-center justify-center rounded-full bg-[#25D366] py-4 text-base font-extrabold text-[#072E1A] active:scale-[0.98] transition-transform">
            QUERO MINHA VAGA GRÁTIS
          </Link>
        </div>
      </div>
    </section>
  );
}