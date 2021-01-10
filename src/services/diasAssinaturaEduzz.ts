import { differenceInDays } from 'date-fns'
import { Planos, PlanosEduzz } from '../model/Planos'
import { logError } from '../logger';
import EduzzService from './eduzz';
import { EduzzResponse, EduzzAuthCredentials } from '../interfaces/Eduzz';

const pegarDiasSobrandoDeAssinatura = async (plano: string, email: string) => {
    const eduzzService = new EduzzService();
    const authCredentials: EduzzAuthCredentials = {email: 'contato.innovatemarketing@gmail.com', publicKey: '98057553', apiKey: '6d6f195185'}
    await eduzzService.authenticate(authCredentials)
    let response: EduzzResponse;
    try {
        response = await eduzzService.getPurchases({client_email: email})
    } catch (err) {
        logError(`ERRO AO PEGAR DIAS SOBRANDO DE ASSINATURA DO USUÁRIO ${email}`,err)
        throw err;
    }
    const ultimoPagamento = response.data[0].date_update
    let diasDeAssinatura
    switch (plano) {
        case PlanosEduzz.START:
            diasDeAssinatura = 30;
            break;
        case PlanosEduzz.PREMIUM:
            diasDeAssinatura = 90;
            break;
        case PlanosEduzz.VIP:
            diasDeAssinatura = 365;
            break;
    }
    const dataUltimoPagamento = toDate(ultimoPagamento)
    console.log(typeof dataUltimoPagamento)
    const hoje = new Date();
    const diasDeUso = differenceInDays(hoje, dataUltimoPagamento)
    const diasParaTerminar = diasDeAssinatura - diasDeUso + 1
    console.log('PARA TERMINAR', diasParaTerminar)
    return diasParaTerminar
}

const toDate = (dateString: string) => {
    const ano = parseInt(dateString.substring(0,4), 10)
    const mes = parseInt(dateString.substring(5,7),10)
    const dia = parseInt(dateString.substring(8,10),10)
    return new Date(ano, mes-1, dia)
}

export { pegarDiasSobrandoDeAssinatura }
