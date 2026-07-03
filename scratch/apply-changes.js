const fs = require('fs');

const filePath = 'app/dashboard/motorista/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  "import { useState, useEffect, useRef } from 'react';",
  "import { useState, useEffect, useRef } from 'react';\nimport { useGPSBroadcast } from '@/lib/hooks/useGPSBroadcast';\nimport { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';\nimport { useOfflineChecklist } from '@/lib/hooks/useOfflineChecklist';"
);

// 2. isOnline & useOfflineChecklist
content = content.replace(
  "const [isOnline, setIsOnline] = useState(true);",
  "const isOnline = useNetworkStatus();\n  const { saveOffline, loadOffline, clearOffline } = useOfflineChecklist(perfilMotorista?.id || null);"
);

// 3. GPS hook inside component
content = content.replace(
  "const [toastType, setToastType] = useState<'success' | 'error'>('success');",
  "const rotaAtivaTemp = rotas.find(r => r.id === selectedRotaId);\n  useGPSBroadcast(rotaAtivaTemp?.ativa ? selectedRotaId : null, perfilMotorista?.id || null);\n  const [toastType, setToastType] = useState<'success' | 'error'>('success');"
);

// 4. saveOffline
content = content.replace(
  "useEffect(() => {\n    selectedRotaIdRef.current = selectedRotaId;\n  }, [selectedRotaId]);",
  "useEffect(() => {\n    selectedRotaIdRef.current = selectedRotaId;\n  }, [selectedRotaId]);\n\n  useEffect(() => {\n    if (temAlteracoes) {\n      saveOffline(rotas);\n    }\n  }, [rotas, temAlteracoes, saveOffline]);"
);

// 5. loadOffline logic
content = content.replace(
  "setRotas(mappedRotas);\n            if (mappedRotas.length > 0 && !mappedRotas.some(r => r.id === selectedRotaId)) {",
  "const offlineRotas = await loadOffline();\n            if (offlineRotas) {\n              setRotas(offlineRotas);\n            } else {\n              setRotas(mappedRotas);\n            }\n            if (mappedRotas.length > 0 && !mappedRotas.some(r => r.id === selectedRotaId)) {"
);

// 6. Remove localizacao_veiculo fake insert
content = content.replace(
  "supabase.from('localizacao_veiculo').insert({\n            rota_id: rotaAtiva.id,\n            latitude: -23.4178,\n            longitude: -51.4269,\n            velocidade_kmh: 40,\n            atualizado_em: new Date().toISOString()\n          })\n        ]);\n\n        if (logsRes?.error) throw logsRes.error;\n        if (notificationsRes?.error) throw notificationsRes.error;\n        if (locRes?.error) throw locRes.error;",
  "]);\n\n        if (logsRes?.error) throw logsRes.error;\n        if (notificationsRes?.error) throw notificationsRes.error;"
);
content = content.replace(
  "const [logsRes, notificationsRes, locRes] =",
  "const [logsRes, notificationsRes] ="
);

// 7. clearOffline
content = content.replace(
  "setToastMessage('Lista enviada com sucesso!');\n        setShowSuccessToast(true);\n        setIsSentSuccessfully(true);",
  "setToastMessage('Lista enviada com sucesso!');\n        setShowSuccessToast(true);\n        setIsSentSuccessfully(true);\n        clearOffline();"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script ran successfully');
