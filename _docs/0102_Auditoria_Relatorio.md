# 📊 Relatório de Auditoria e Conformidade

> **Data do relatório:** 28/05/2026  
> **Status Geral:** ✅ Compilado com Sucesso (15/15 páginas Next.js)

---

## 1. Status das Rotas e Middleware

| Rota | Descrição | Status | Proteção (Middleware) |
| :--- | :--- | :---: | :---: |
| `/` | Landing Page municipal | ✅ | Livre (Público) |
| `/login` | Entrada de CPF e senha (mock + real) | ✅ | Redireciona se logado |
| `/dashboard/admin` | Dashboard administrativo SEMED | ✅ | Protegido |
| `/dashboard/admin/alunos` | CRUD e Gestão de Alunos | ✅ | Protegido |
| `/dashboard/admin/frota` | CRUD e Gestão de Frota/Veículos | ✅ | Protegido |
| `/dashboard/admin/documentos` | Análise de documentos da carteirinha | ✅ | Protegido |
| `/dashboard/admin/rotas` | CRUD e Gestão de Itinerários | ✅ | Protegido |
| `/dashboard/motorista` | Painel mobile-first com checklist e scanner | ✅ | Protegido |
| `/responsavel/dashboard` | Portal dos pais (filhos vinculados) | ✅ | Protegido |
| `/responsavel/documentos` | Envio de arquivos da carteirinha | ✅ | Protegido |
| `/responsavel/carteirinha/[id]` | Carteirinha Digital com QR Code real | ✅ | Protegido |
| `/responsavel/rastreio/[rota_id]` | Rastreamento GPS ativo | ✅ | Protegido |

---

## 2. Lógica e Inteligência de Faltas (checklist)

- **Três Estados Visuais na Lista:**
  - **Pendente:** Estado padrão inicial. Nome em cor neutra e badge cinza.
  - **Presente (Confirmado):** Card/nome destacado em Verde, badge de status verde "Presente", e tag de texto "Presente" antes do nome.
  - **Faltou (Ausente):** Card/nome destacado em Vermelho, badge de status vermelho "Faltou", e tag de texto "Faltou" em vermelho destacado antes do nome.
- **Botão de Envio (Lote):** Quando ativado, processa as presenças dos escaneados como `'PRESENTE'` e insere automaticamente todos os demais alunos do itinerário/turno como `'AUSENTE'` no banco remoto.
- **Feedback de Sucesso e Reset:** O botão assume temporariamente o estado de sucesso (verde com ícone check e texto *"Lista Enviada com Sucesso!"*) e após 3 segundos a lista local é completamente resetada para `Pendente`, ficando pronta para a próxima viagem.

---

## 3. Escâner de Câmera Real (html5-qrcode)

- **Viewfinder de Câmera Real:** O leitor de QR Code estático foi substituído por um leitor ativo de câmera (priorizando a câmera traseira do motorista via `facingMode: "environment"`).
- **Correção de Proporção:** Injetado estilo global para forçar o elemento `<video>` gerado pela biblioteca a cobrir `100%` da largura/altura do container (`object-fit: cover` com cantos arredondados).
- **Feedbacks Sensoriais (Acessibilidade):**
  - **Embarque Correto:** Emite um bipe agudo via *Web Audio API*, pulsa vibração física (`100ms`) e dita *"Thiago confirmado"* via Text-to-Speech.
  - **Embarque Incorreto:** Emite bipes graves duplos, vibra duas vezes de forma pausada e dita *"Atenção, rota incorreta"*.

---

## 4. Persistência de Dados e Turno

- **Tabela `logs_embarque`:** Colunas `status` (`PRESENTE`/`AUSENTE`), `data_registro` (tipo `DATE` default `CURRENT_DATE`) e `turno` (`Matutino`, `Vespertino`, `Noturno`) criadas no Supabase remoto e sincronizadas na migration `20260528162700_add_turno_to_logs.sql`.
- **Turnos do Seletor:** O seletor de turno de trabalho no topo da tela do motorista (`Manhã`, `Tarde`, `Noite`) é mapeado e salvo no Supabase como (`Matutino`, `Vespertino`, `Noturno`).
- **Histórico Retroativo:** Exibição do turno nos históricos dos painéis dos pais e do administrador (SEMED).

---

## 5. Sugestões de Melhorias Técnicas (Próxima Sprint)

1. **Redirecionamento de Perfis no Middleware:** Adicionar checagem dinâmica da role real (`perfis.tipo_usuario`) ao tentar entrar em `/login` enquanto autenticado no Supabase, garantindo que o admin e o motorista caiam diretamente em seus respectivos painéis em vez do Portal dos Pais padrão.
2. **Integração Real com Mapbox:** Substituir o placeholder visual do mapa no Admin Dashboard por um mapa Mapbox interativo conectado ao rastreamento da frota.
3. **Persistência de Logs Offline no Flutter:** Habilitar sincronização em lote resiliente usando a box `logs_embarque` do Hive caso o motorista esteja em zonas rurais sem cobertura de dados 4G.
