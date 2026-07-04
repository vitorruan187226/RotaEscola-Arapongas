const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/motorista/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state variable
const stateMarker = `const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);`;
const stateMarkerIdx = content.indexOf(stateMarker);
if (stateMarkerIdx !== -1) {
    const newState = `const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLigada, setIsCameraLigada] = useState(false);
  const mainScannerRef = useRef<any>(null);`;
    content = content.substring(0, stateMarkerIdx) + newState + content.substring(stateMarkerIdx + stateMarker.length);
}

// 2. Replace useEffect for camera
const useEffectStart = `// Inicializa o Scanner real usando a camera do dispositivo
  useEffect(() => {
    let html5QrCode: any = null;`;
const useEffectEnd = `}, []);`;

const useEffectStartIdx = content.indexOf(useEffectStart);
const useEffectEndIdx = content.indexOf(useEffectEnd, useEffectStartIdx);

if (useEffectStartIdx !== -1 && useEffectEndIdx !== -1) {
    const newUseEffect = `// Controle dinâmico do Scanner Principal
  useEffect(() => {
    async function startCamera() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        mainScannerRef.current = new Html5Qrcode("reader");
        
        await mainScannerRef.current.start(
          { facingMode: "environment" },
          { fps: 15 },
          (decodedText: string) => {
            handleQrCodeScanned(decodedText);
          },
          () => {}
        );
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Erro ao iniciar camera:", err);
        setHasCameraPermission(false);
      }
    }

    if (isCameraLigada) {
      setTimeout(() => startCamera(), 200);
    } else {
      if (mainScannerRef.current && mainScannerRef.current.isScanning) {
        mainScannerRef.current.stop().catch((e: any) => console.log(e));
      }
    }

    return () => {
      if (mainScannerRef.current && mainScannerRef.current.isScanning) {
        mainScannerRef.current.stop().catch((e: any) => console.log(e));
      }
    };
  }, [isCameraLigada]);`;

    content = content.substring(0, useEffectStartIdx) + newUseEffect + content.substring(useEffectEndIdx + useEffectEnd.length);
}

// 3. Replace the UI block
const uiStart = `{/* Câmera do Scanner */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-6">`;
const uiEnd = `</section>
          )}`;

const uiStartIdx = content.indexOf(uiStart);
const uiEndIdx = content.indexOf(uiEnd, uiStartIdx);

if (uiStartIdx !== -1 && uiEndIdx !== -1) {
    const newUI = `{/* Câmera do Scanner */}
          {rotaAtiva?.ativa && (
            <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-6 animate-fadeIn">
               <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-sm font-bold text-[#1a2b4c]">Câmera de Leitura</h3>
                 <button 
                   onClick={() => setIsCameraLigada(!isCameraLigada)} 
                   className={\`font-bold text-[10px] uppercase px-3 py-1.5 rounded-full transition-all \${isCameraLigada ? 'bg-rose-100 text-rose-700' : 'bg-[#d6e3ff] text-[#002045]'}\`}
                 >
                   {isCameraLigada ? 'Desligar' : 'Ligar'}
                 </button>
               </div>
               
               {isCameraLigada ? (
                 <div className="relative w-full h-40 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200">
                    <div id="reader" className="w-full h-full absolute inset-0 z-0"></div>
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_#3b82f6] z-20 scanner-line pointer-events-none" />
                    
                    {scanState === 'success' && scannedAluno && (
                      <div className="absolute inset-0 bg-emerald-500/95 z-30 flex flex-col items-center justify-center p-4">
                        <CheckCircle2 size={36} className="text-white mb-2" />
                        <p className="text-white font-bold text-center text-sm">{scannedAluno.nome}</p>
                      </div>
                    )}
                    {scanState === 'error' && (
                      <div className="absolute inset-0 bg-rose-500/95 z-30 flex flex-col items-center justify-center p-4">
                        <XCircle size={36} className="text-white mb-2" />
                        <p className="text-white font-bold text-center text-sm">{scanErrorMsg}</p>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="relative w-full h-40 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                   <Camera size={32} className="mb-2 opacity-40" />
                   <p className="text-xs font-semibold">Câmera Desligada</p>
                 </div>
               )}
            </section>
          )}`;
    
    content = content.substring(0, uiStartIdx) + newUI + content.substring(uiEndIdx + uiEnd.length);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Correção da Câmera aplicada com sucesso!");
