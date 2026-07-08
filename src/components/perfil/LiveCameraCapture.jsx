import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check } from 'lucide-react';

export default function LiveCameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        setError(
          err.name === 'NotAllowedError'
            ? 'Permissão de câmera negada. Abra as configurações e autorize.'
            : 'Não foi possível acessar a câmera. Tente usar outro navegador.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const imageSrc = canvasRef.current.toDataURL('image/jpeg');
    onCapture(imageSrc);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-slate-100 rounded-lg overflow-hidden relative">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 border-4 border-cyan-400 rounded-lg pointer-events-none" />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            {isLoading ? (
              <p className="text-slate-500">Iniciando câmera...</p>
            ) : (
              <p className="text-slate-500">Câmera desativada</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 text-center">
        📸 Tire uma foto clara do seu rosto. Use boa iluminação, olhe direto para a câmera e sem acessórios.
      </p>

      <div className="flex gap-2">
        {isCameraActive ? (
          <>
            <Button
              onClick={capturePhoto}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold h-11"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capturar Foto
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              size="icon"
              className="h-11 w-11"
              title="Cancelar"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsCameraActive(true)}
            variant="outline"
            className="w-full h-11"
            disabled={isLoading}
          >
            <Camera className="w-5 h-5 mr-2" />
            {isLoading ? 'Iniciando câmera...' : 'Abrir Câmera'}
          </Button>
        )}
      </div>
    </div>
  );
}