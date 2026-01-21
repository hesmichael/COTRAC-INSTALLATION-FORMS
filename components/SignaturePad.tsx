
import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasContent(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      onSave(canvas.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative w-full h-80 bg-white rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-200 cursor-crosshair group touch-none">
        {/* Security Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000080 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        
        {!hasContent && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300 transition-opacity group-hover:opacity-20">
                <i className="fa-solid fa-pen-nib text-4xl mb-4"></i>
                <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sign Above This Line</span>
                <div className="w-48 h-[1px] bg-slate-200 mt-4"></div>
            </div>
        )}

        <div className="absolute bottom-6 right-6 z-20">
            <button
                type="button"
                onClick={clear}
                className="w-10 h-10 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all border border-slate-100 shadow-sm"
                title="Clear Signature"
            >
                <i className="fa-solid fa-rotate-left text-sm"></i>
            </button>
        </div>
      </div>
      <div className="px-6 flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest">
        <span>Capture Method: Digital Stylus/Touch</span>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400/20"></div>
            <span>Electronic Timestamp Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
