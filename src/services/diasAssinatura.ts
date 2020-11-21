import { differenceInDays } from 'date-fns'
import { Planos } from '../model/Planos'
import { getMonetizzeProductTransaction } from './request';
import { logError } from '../logger';

const pegarDiasSobrandoDeAssinatura = async (plano: string, email: string) => {
    let response
    try {
        response = await getMonetizzeProductTransaction({email})
    } catch (err) {
        logError(`ERRO AO PEGAR DIAS SOBRANDO DE ASSINATURA DO USUÁRIO ${email}`,err)
        throw err;
    }
    let ultimoPagamento;
    if (response.dados[0].venda.formaPagamento === 'Boleto' && response.dados[0].venda.dataFinalizada) {
        ultimoPagamento = response.dados[0].venda.dataInicio
    }
    if (response.dados[0].venda.formaPagamento === 'Cartão de crédito' && response.dados[0].venda.dataFinalizada) {
        ultimoPagamento = response.dados[0].venda.dataFinalizada
    }
    let diasDeAssinatura
    switch (plano) {
        case Planos.START:
            diasDeAssinatura = 30;
            break;
        case Planos.PREMIUM:
            diasDeAssinatura = 90;
            break;
        case Planos.MASTER:
            diasDeAssinatura = 365;
            break;
    }
    if (response.dados[0].venda.formaPagamento === 'Boleto') {
        if (response.dados[0].plano.codigo === Planos.START && parseInt(response.dados[0].venda.valor, 10) > 100) {
            const dataUltimoPagamento = toDate(response.dados[0].venda.dataInicio)
            const hoje = new Date();
            const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
            diasDeAssinatura = 35;
            const diasParaTerminar = diasDeAssinatura - diasDeUso + 1
            return diasParaTerminar
        } else if (response.dados[0].plano.codigo === Planos.START && parseInt(response.dados[0].venda.valor, 10) === 100) {
            const dataUltimoPagamento = toDate(response.dados[0].venda.dataInicio)
            const hoje = new Date();
            const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
            const diasParaTerminar2 = diasDeAssinatura - diasDeUso + 1
            return diasParaTerminar2
        } else if (response.dados[0].plano.codigo !== Planos.START) {
            const dataUltimoPagamento = toDate(response.dados[0].venda.dataInicio)
            const hoje = new Date();
            const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
            const diasParaTerminar2 = diasDeAssinatura - diasDeUso + 1
            return diasParaTerminar2
        }
    } else {
        const dataUltimoPagamento = toDate(ultimoPagamento)
        const hoje = new Date();
        const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
        const diasParaTerminar = diasDeAssinatura - diasDeUso + 1
        return diasParaTerminar
}

}

const toDate = (dateString: string) => {
    const ano = parseInt(dateString.substring(0,4), 10)
    const mes = parseInt(dateString.substring(5,7),10)
    const dia = parseInt(dateString.substring(8,10),10)
    return new Date(ano, mes-1, dia)
}

export { pegarDiasSobrandoDeAssinatura, toDate }
