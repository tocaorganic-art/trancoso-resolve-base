import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// CONFIGURAÇÃO DO VÍDEO DA TOCA
// ============================================================================
// Cole aqui a URL do MP4 da Toca (D-ID, SadTalker, HeyGen, etc.)
// Ex: "https://exemplo.com/toca-video.mp4"
// Ex YouTube: "https://www.youtube.com/watch?v=VIDEO_ID"
// Deixe vazio ("") para usar o fallback de áudio por navegador
const TOCA_VIDEO_URL = "";

const ROTEIRO_TOCA = "Oi! Eu sou a Toca, sua anfitriã aqui em Trancoso. Vou te mostrar como é fácil resolver seu corre. Primeiro, é só encontrar o serviço: navegue pelas categorias ou use a busca pra achar exatamente o que você precisa, de uma faxina a um passeio exclusivo. Depois, agende com facilidade: escolha o melhor profissional pelas avaliações, veja os detalhes, marque a data e envie sua solicitação em poucos cliques. E pronto, problema resolvido: o prestador confirma, faz o serviço, e no final você avalia e ajuda nossa comunidade a crescer. Se você é prestador, também é simples: crie seu perfil de graça, receba as propostas e faça seu negócio crescer aqui na vila. Bora resolver?";

export default function TocaAvatar() {
  // Estados para vídeo
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const videoRef = useRef(null);
  
  // Estados para áudio (fallback)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const synth = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Detectar se é URL do YouTube
  const isYouTube = TOCA_VIDEO_URL && (TOCA_VIDEO_URL.includes('youtube.com') || TOCA_VIDEO_URL.includes('youtu.be'));
  const youtubeId = isYouTube ? (TOCA_VIDEO_URL.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]) : null;
  
  // MODO: true = vídeo, false = áudio fallback
  const hasVideo = TOCA_VIDEO_URL && TOCA_VIDEO_URL.trim() !== "";

  // Carregar vozes para fallback de áudio
  useEffect(() => {
    if (!synth.current) return;

    const loadVoices = () => {
      const availableVoices = synth.current ? synth.current.getVoices() : [];
      
      // Buscar voz feminina em português do Brasil
      const ptVoices = availableVoices.filter(v => v.lang.startsWith('pt'));
      const femaleVoice = ptVoices.find(v => 
        v.name.includes('Luciana') || 
        v.name.includes('Maria') || 
        v.name.includes('Francisca') ||
        v.name.includes('Google português do Brasil') ||
        v.name.includes('Microsoft Maria') ||
        v.name.includes('Brazilian Portuguese') ||
        v.name.includes('Vitoria')
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
      } else if (ptVoices.length > 0) {
        setSelectedVoice(ptVoices[0]);
      }
      
      setVoicesLoaded(true);
    };

    loadVoices();

    if (synth.current.onvoiceschanged !== undefined) {
      synth.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  // Funções de áudio (fallback)
  const falar = useCallback(() => {
    if (!synth.current || !selectedVoice) return;

    synth.current.cancel();

    const newUtterance = new SpeechSynthesisUtterance(ROTEIRO_TOCA);
    newUtterance.voice = selectedVoice;
    newUtterance.lang = 'pt-BR';
    newUtterance.rate = 1.0;
    newUtterance.pitch = 1.1;
    newUtterance.volume = 1.0;

    newUtterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    newUtterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    newUtterance.onpause = () => setIsPaused(true);
    newUtterance.onresume = () => setIsPaused(false);
    newUtterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.current.speak(newUtterance);
  }, [selectedVoice]);

  const handlePlayPause = () => {
    if (!voicesLoaded) return;
    
    if (isSpeaking && !isPaused) {
      synth.current?.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synth.current?.resume();
    } else {
      falar();
    }
  };

  const handleStop = () => {
    synth.current?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Funções de vídeo
  const handleVideoPlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoPlaying && !videoPaused) {
      videoRef.current.pause();
      setVideoPaused(true);
    } else if (videoPaused) {
      videoRef.current.play();
    } else {
      videoRef.current.play();
    }
  };

  const handleVideoStop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setVideoPlaying(false);
    setVideoPaused(false);
  };

  // Renderizar player de vídeo (MP4 ou YouTube)
  const renderVideoPlayer = () => {
    if (isYouTube && youtubeId) {
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title="Vídeo da Toca"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group">
        <video
          ref={videoRef}
          src={TOCA_VIDEO_URL}
          className="w-full h-full object-cover"
          playsInline
          poster="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=450&fit=crop&crop=face"
          onPlay={() => {
            setVideoPlaying(true);
            setVideoPaused(false);
          }}
          onPause={() => setVideoPaused(true)}
          onEnded={() => {
            setVideoPlaying(false);
            setVideoPaused(false);
          }}
          controls
        >
          <track kind="captions" src="" label="Português" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        
        {/* Overlay com botão de play grande (aparece antes do play) */}
        {!videoPlaying && !videoPaused && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl animate-pulse">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#0a1628]/90 backdrop-blur-md border border-white/10 shadow-2xl p-6 md:p-8">
      <div className="space-y-6">
        {hasVideo ? (
          /* MODO VÍDEO - Player principal */
          <div className="space-y-4">
            {/* Player de vídeo */}
            {renderVideoPlayer()}
            
            {/* Controles e título */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Conheça a Toca</h3>
                  <p className="text-slate-300 text-sm">
                    {videoPlaying && !videoPaused ? 'Reproduzindo...' : videoPaused ? 'Pausado' : 'Sua anfitriã virtual'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleVideoPlayPause}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg"
                  aria-label={videoPlaying && !videoPaused ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                >
                  {videoPlaying && !videoPaused ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {videoPaused ? 'Continuar' : '▶ Assistir'}
                    </>
                  )}
                </Button>

                {videoPlaying && (
                  <Button
                    onClick={handleVideoStop}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    aria-label="Parar vídeo"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Botão de áudio como fallback */}
            <div className="pt-2 border-t border-white/10">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-sm"
                aria-label="Ouvir em áudio"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isSpeaking && !isPaused ? 'Pausar áudio' : isPaused ? 'Continuar áudio' : '🎧 Ouvir em áudio (sem vídeo)'}
              </Button>
              
              {isSpeaking && !isPaused && (
                <span className="text-amber-300 text-sm font-medium ml-3 animate-pulse">
                  ✨ falando...
                </span>
              )}
            </div>

            {/* Roteiro em texto para acessibilidade */}
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="font-semibold text-amber-400">Transcrição:</span> {ROTEIRO_TOCA}
              </p>
            </div>
          </div>
        ) : (
          /* MODO ÁUDIO - Fallback com avatar estático e narração por navegador */
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            {/* Avatar da Toca */}
            <div className="relative flex-shrink-0">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl relative ${isSpeaking && !isPaused ? 'animate-pulse' : ''}`}>
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
                  alt="Toca - Anfitriã Virtual de Trancoso"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Indicador de falando - ondas sonoras */}
              {isSpeaking && !isPaused && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 bg-amber-400 rounded-full animate-bounce"
                      style={{
                        height: `${i * 8}px`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Balão de fala com texto */}
            <div className="flex-1 w-full">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/10">
                {/* Seta do balão */}
                <div className="absolute -left-2 top-6 w-4 h-4 bg-white/5 border-l border-b border-white/10 transform rotate-45 hidden md:block" />
                
                <div className="flex items-start gap-3">
                  <Volume2 className={`w-5 h-5 text-amber-400 flex-shrink-0 mt-1 ${isSpeaking && !isPaused ? 'animate-pulse' : ''}`} />
                  
                  <div className="flex-1">
                    <p className="text-white/90 text-sm md:text-base leading-relaxed">
                      {ROTEIRO_TOCA}
                    </p>
                    
                    {/* Controles de áudio */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                      <Button
                        onClick={handlePlayPause}
                        disabled={!voicesLoaded}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg disabled:opacity-50"
                        aria-label={isSpeaking && !isPaused ? 'Pausar narração' : 'Ouvir explicação'}
                      >
                        {isSpeaking && !isPaused ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {isPaused ? 'Continuar' : '▶ Ouça a Toca explicar'}
                          </>
                        )}
                      </Button>

                      {isSpeaking && (
                        <Button
                          onClick={handleStop}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 text-sm"
                          aria-label="Parar narração"
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}

                      {isSpeaking && !isPaused && (
                        <span className="text-amber-300 text-sm font-medium ml-auto animate-pulse">
                          ✨ falando...
                        </span>
                      )}
                    </div>
                    
                    {!voicesLoaded && (
                      <p className="text-slate-400 text-xs mt-2">
                        Carregando vozes...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}