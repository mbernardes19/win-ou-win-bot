import { AuthCredentials, Options, ApiResponse } from "../services/coursePlatform";

export interface EduzzAuthCredentials extends AuthCredentials {
    publicKey: string;
    apiKey: string;
    email: string;
}

export interface EduzzResponse extends ApiResponse {
    success: boolean;
    data: EduzzSale[];
    paginator: Paginator;
}

export interface EduzzSale {
    sale_id: number;
    contract_id?: number;
    date_create?: string;
    date_payment?: string;
    date_update?: string;
    sale_status?: number;
    sale_status_name?: string;
    sale_payment_method?: string
    client_id?: number;
    client_name?: string;
    client_email?: string;
    content_id?: number;
    content_title?: string;
}

export interface Paginator {
    page: number;
    size: number;
    totalPages: number;
    totalRows: number;
}

export interface EduzzSaleOptions extends Options {
    page?: number;
    contract_id?: number;
    content_id?: number;
    client_email?: string;
}

export enum EduzzSaleStatus {
    ABERTA = 1,
    PAGA = 3,
    CANCELADA = 4,
    AGUARDANDO_REEMBOLSO = 6,
    REEMBOLSADO = 7,
    EXPIRADA = 10,
    EM_RECUPERACAO = 11
}

export enum Product {
   BASIC = 597459,
   basic = 599123,
   PREMIUM = 643145,
   VIP = 636151
}