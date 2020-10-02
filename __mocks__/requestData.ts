import { MonetizzeTransactionResponse } from "../src/interfaces/Monetizze";

const baseMockedDadosRequest =
        {
            chave_unica: '123',
            produto: {
                chave: '123',
                codigo: 'asd',
                nome: 'asd'
            },
            venda: {
                codigo: '12',
                dataInicio: '123',
                meioPagamento: 'asd',
                formaPagamento: 'asd',
                status: 'asd',
                valor: '13',
                valorRecebido: '123'
            }
        }

export default baseMockedDadosRequest;