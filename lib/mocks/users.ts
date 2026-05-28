export interface MockUser {
  cpf: string;
  senha: string;
  nome: string;
  tipo_usuario: 'Admin' | 'Motorista' | 'Responsável';
  detalhes: {
    cargo?: string;
    filho?: string;
    escola?: string;
  };
}

export const mockUsers: MockUser[] = [
  {
    cpf: '99999999999',
    senha: 'adminisenha',
    nome: 'Carlos SEMED (Admin)',
    tipo_usuario: 'Admin',
    detalhes: {
      cargo: 'Administrador do Sistema',
    }
  },
  {
    cpf: '33333333333',
    senha: 'motoristasenha',
    nome: 'Roberto Ferreira (Motorista)',
    tipo_usuario: 'Motorista',
    detalhes: {
      cargo: 'Motorista Rota 04 — Zona Rural',
    }
  },
  {
    cpf: '22222222222',
    senha: 'responsavelsenha',
    nome: 'José Santos (Responsável)',
    tipo_usuario: 'Responsável',
    detalhes: {
      filho: 'Pedro Henrique Silva',
      escola: 'Escola Municipal Codorna',
    }
  }
];
