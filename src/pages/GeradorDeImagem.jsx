import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Download, Image as ImageIcon, LogIn, RefreshCw, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const STYLE_OPTIONS = ["Realista", "Ilustração", "3D", "Aquarela", "Minimalista"];
const FORMAT_OPTIONS = [
  { label: "Quadrado", value: "quadrado" },
  { label: "Retrato", value: "retrato" },
  { label: "Paisagem", value: "paisagem" },
];
const DETAIL_OPTIONS = ["Simples", "Detalhado", "Hiper-realista"];

const TEMPLATE_PROMPTS = [
  { label: "Logo luxo Trancoso", prompt: "Logo minimalista para um serviço de luxo em Trancoso, elegante, dourado e sofisticado" },
  { label: "Pôr do sol Trancoso", prompt: "Paisagem de Trancoso ao pôr do sol em estilo aquarela, cores vibrantes, coqueiros, praia" },
  { label: "Post Instagram", prompt: "Post para Instagram anunciando um serviço exclusivo em Trancoso, visual moderno e atraente" },
  { label: "Avatar 3D prestador", prompt: "Avatar estilizado em 3D para prestador de serviço, profissional, fundo neutro, traços modernos" },
];

export default function GeradorDeImagemPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [detail, setDetail] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  // Bloqueio para não logados
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Toca Vision</h1>
          <p className="text-slate-600 mb-2 text-sm font-medium">Gerador de imagens com IA</p>
          <p className="text-slate-500 text-sm mb-6">
            Para usar o <strong>Toca Vision</strong>, é necessário ter cadastro e estar logado como prestador ou cliente.
          </p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 mb-3"
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Entrar para usar o Toca Vision
          </Button>
          <p className="text-xs text-slate-400">Não tem conta? Clique em Entrar e escolha "Cadastre-se".</p>
        </div>
      </div>
    );
  }

  const buildFullPrompt = () => {
    let full = prompt.trim();
    if (style) full += `, estilo ${style}`;
    if (detail) full += `, ${detail}`;
    return full;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Descreva a imagem que deseja criar.');
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const result = await base44.integrations.Core.GenerateImage({ prompt: buildFullPrompt() });
      if (result.url) {
        setGeneratedImage(result.url);
        toast.success('Imagem criada com sucesso!', { icon: <Sparkles className="w-4 h-4" /> });
      }
    } catch (error) {
      toast.error('Não foi possível gerar a imagem', { description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariation = async () => {
    if (!generatedImage) return;
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: buildFullPrompt(),
        existing_image_urls: [generatedImage]
      });
      if (result.url) {
        setGeneratedImage(result.url);
        toast.success('Variação criada!');
      }
    } catch (error) {
      toast.error('Erro ao variar imagem', { description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `toca-vision-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            Toca Vision
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Crie com o Toca Vision</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Gere imagens exclusivas em alta qualidade usando inteligência artificial, ideal para posts, marcas e experiências em Trancoso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de criação */}
          <div className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Descreva sua imagem</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva a imagem que você quer criar com o Toca Vision…"
                    rows={4}
                    className="resize-none text-base"
                  />
                </div>

                {/* Estilo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Estilo</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setStyle(style === s ? '' : s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${style === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'}`}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                {/* Detalhe */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Nível de detalhe</label>
                  <div className="flex gap-2">
                    {DETAIL_OPTIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setDetail(detail === d ? '' : d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${detail === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                      >{d}</button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-h-[48px] text-base font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Criando sua arte…</>
                  ) : (
                    <><Wand2 className="w-5 h-5 mr-2" /> Gerar imagem com Toca Vision</>
                  )}
                </Button>
                {isGenerating && (
                  <p className="text-xs text-center text-slate-400">Criando sua arte… isso leva alguns segundos.</p>
                )}
              </CardContent>
            </Card>

            {/* Templates */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prompts prontos — clique para usar</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_PROMPTS.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setPrompt(t.prompt)}
                    className="text-left bg-white border border-slate-200 hover:border-purple-400 rounded-xl p-3 shadow-sm transition-all"
                  >
                    <p className="text-xs font-semibold text-slate-700 mb-0.5">{t.label}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resultado */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Resultado</p>
              {!generatedImage && !isGenerating && (
                <div className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-14 h-14 mb-3 opacity-50" />
                  <p className="text-sm">Sua imagem aparecerá aqui</p>
                </div>
              )}
              {isGenerating && (
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex flex-col items-center justify-center">
                  <Loader2 className="w-14 h-14 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm text-purple-700 font-semibold">Criando sua arte…</p>
                  <p className="text-xs text-purple-500 mt-1">Isso leva alguns segundos</p>
                </div>
              )}
              {generatedImage && !isGenerating && (
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img src={generatedImage} alt="Imagem gerada pelo Toca Vision" className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" /> Baixar
                    </Button>
                    <Button onClick={handleVariation} variant="outline" size="sm" disabled={isGenerating} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-1" /> Variar
                    </Button>
                    <Button onClick={() => { setGeneratedImage(null); }} variant="outline" size="sm" className="flex-1">
                      <Wand2 className="w-4 h-4 mr-1" /> Refinar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}