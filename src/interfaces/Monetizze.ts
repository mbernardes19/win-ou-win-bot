export interface MonetizzeTrasactionOptions {
    productId?: string,
    transactionId?: number,
    email?: string,
    date_min?: string,
    date_max?: string,
    end_date_min?: string,
    end_date_max?: string,
    'status[]'?: number|number[],
    'forma_pagamento[]'?: number,
    page?: number
};

export interface MonetizzeTransactionResponse {
    dados?: MonetizzeTransaction[] | null,
    recordCount: string,
    pages: number,
    error: string,
}

export interface MonetizzeTransaction {
    chave_unica: string,
    produto: Produto,
    venda: Venda,
    comissoes?: Comissoes | null,
    comprador: Comprador,
    produtor: Produtor,
    assinatura?: Assinatura,
    plano?: Plano,
    downloads: string
}

export interface Produto {
    codigo: string,
    chave: string,
    nome: string,
}

export interface Plano {
    codigo: string,
    referenia: string,
    nome: string,
    periodicidade: string|number
}

export interface Assinatura {
    codigo: string,
    status: string|number,
    data_assinatura: string,
    parcela: string|number
}

export interface Venda {
    codigo: string;
    plano?: string | null;
    dataInicio: string;
    dataFinalizada?: string | null;
    meioPagamento: string;
    formaPagamento: string;
    garantiaRestante: number;
    status: string;
    valor: string;
    quantidade: string;
    valorRecebido: string;
    tipo_frete: string;
    frete: string;
    cupom?: string | null;
    src: string;
    utm_source: string;
    utm_medium: string;
    utm_content: string;
    utm_campaign: string;
    linkBoleto: string;
    linha_digitavel: string;
    boleto_vencimento?: string;
}

export interface Comissoes {
    nome: string;
    tipo_comissao: string;
    valor: string;
    porcentagem: string;
}

export interface Comprador {
    nome: string;
    email: string;
    data_nascimento: string;
    cnpj_cpf: string;
    telefone: string;
    cep: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  }

export interface Produtor {
    cnpj_cpf: string;
    nome: string;
}
