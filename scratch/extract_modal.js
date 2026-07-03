const fs = require('fs');

const filePath = 'app/dashboard/admin/escolas/detalhes/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add import
const importStatement = "import { ModalConfirmarExclusao } from '@/components/admin/escolas/ModalConfirmarExclusao';\n";
if (!content.includes('ModalConfirmarExclusao')) {
  content = content.replace("import { createClient } from '@/lib/supabase/client';", "import { createClient } from '@/lib/supabase/client';\n" + importStatement);
}

// Extract modal block
const targetStr = `      {/* MODAL: CONFIRMAR EXCLUSÃO DE ALUNO */}
      {modalExcluir && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border flex flex-col animate-fadeIn">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle size={18} />
                <h3 className="font-black text-slate-900 text-sm">Excluir Aluno</h3>
              </div>
              <button onClick={() => setModalExcluir(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-2">
              <p className="text-xs font-bold text-slate-800">
                Deseja realmente remover este aluno do sistema de transporte?
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Esta ação é permanente e removerá o aluno <strong>{modalExcluir.nome}</strong>, sua carteirinha digital, registros de embarque e documentos associados do banco de dados do município de Arapongas.
              </p>
            </div>

            <div className="px-5 py-4 border-t bg-slate-50 flex gap-2 justify-end">
              <button
                onClick={() => setModalExcluir(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border text-slate-600 hover:bg-slate-105 transition-colors bg-white"
              >
                Voltar
              </button>
              <button
                disabled={loadingAction === modalExcluir.id}
                onClick={handleConfirmExcluir}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow flex items-center justify-center gap-1.5"
              >
                {loadingAction === modalExcluir.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirmar Exclusão</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}`;

const replacementStr = `      {/* MODAL: CONFIRMAR EXCLUSÃO DE ALUNO */}
      <ModalConfirmarExclusao
        modalExcluir={modalExcluir}
        setModalExcluir={setModalExcluir}
        loadingAction={loadingAction}
        handleConfirmExcluir={handleConfirmExcluir}
      />`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script concluded');
