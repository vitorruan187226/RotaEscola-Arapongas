# Arquitetura e Configuração Mobile (06XX)

Este quarteirão documenta as especificações, dependências e padrões arquiteturais do aplicativo móvel Flutter do **RotaEscola Arapongas**.

## Stack Tecnológica
* **Framework:** Flutter 3.x
* **Gerenciamento de Estado:** Bloc/Cubit ou ValueNotifier simples (focado em responsabilidade única)
* **Banco de Dados Local (Offline-First):** Hive para armazenamento temporário e offline de logs de embarque.
* **Detecção de Rede:** `connectivity_plus` para gerenciar status de conexão.
* **Leitor QR Code:** `mobile_scanner` de alta performance.
* **Upload de Arquivos:** `image_picker` e Supabase Storage.

## Contratos de Dados (Tabelas Relacionadas)

### Tabela `carteirinhas`
```sql
create table carteirinhas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references alunos(id),
  qr_code_hash text unique not null,
  ativa boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Tabela `logs_embarque` (Tabela que sincroniza os embarques)
```sql
create table logs_embarque (
  id uuid primary key default gen_random_uuid(),
  carteirinha_hash text not null,
  data_hora timestamp with time zone default timezone('utc'::text, now()),
  status_autorizacao text not null, -- 'Embarque Autorizado' ou 'Carteirinha Inválida'
  sincronizado boolean default true
);
```
