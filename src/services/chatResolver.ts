import { isBefore } from 'date-fns'
import { Planos } from '../model/Planos';
import { log, logError } from '../logger';

export async function getChat(plano: string, dataAssinatura: string): Promise<[string, string]> {
    let chat;
    let chatName;
    log(`💬 Pegando para plano ${plano} feito na data ${dataAssinatura}`)
    if (process.env.NODE_ENV === 'production') {
        switch(plano) {
            case Planos.SILVER:
                chat = process.env.ID_CANAL_SILVER;
                chatName = 'Canal Prata'
                break;
            case Planos.GOLD:
                chat = process.env.ID_CANAL_GOLD;
                chatName = 'Canal Gold'
                break;
            case Planos.DIAMOND:
                chat = process.env.ID_CANAL_DIAMOND;
                chatName = 'Canal Diamond'
                break;
            case Planos.BLACK_DIAMOND:
                chat = process.env.ID_GRUPO_BLACK_DIAMOND;
                chatName = 'Grupo Black Diamond'
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    } else {
        switch(plano) {
            case Planos.SILVER:
                chat = process.env.ID_CANAL_TEST_SILVER;
                chatName = 'Canal Prata'
                break;
            case Planos.GOLD:
                chat = process.env.ID_CANAL_TEST_GOLD;
                chatName = 'Canal Gold'
                break;
            case Planos.DIAMOND:
                chat = process.env.ID_CANAL_TEST_DIAMOND;
                chatName = 'Canal Diamond'
                break;
            case Planos.BLACK_DIAMOND:
                chat = process.env.ID_GRUPO_TEST_BLACK_DIAMOND;
                chatName = 'Grupo Black Diamond'
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    }

    try {
        if (process.env.NODE_ENV === 'production') {
            if (checkIfIsBefore(dataAssinatura, new Date(2020,7,6))) {
                log(`Compra feita antes de 06/08. Enviando canal Gold.`)
                return ['Canal Gold', process.env.ID_CANAL_GOLD]
            } else {
                log(`Compra feita depois de 06/08. Enviando canal correspondente ${chat}.`)
                return [chatName, chat]
            }
        } else {
            if (checkIfIsBefore(dataAssinatura, new Date(2020,7,6))) {
                log(`Compra feita antes de 06/08. Enviando canal Gold.`)
                return ['Canal Gold', process.env.ID_CANAL_TEST_GOLD]
            } else {
                log(`Compra feita depois de 06/08. Enviando canal correspondente ${chat}.`)
                return [chatName, chat]
            }
        }
    } catch (err) {
        throw err
    }
}

const checkIfIsBefore = (data1: string, data2:Date) => {
    try {
        const ano = parseInt(data1.substring(0,4), 10)
        const mes = parseInt(data1.substring(5,7),10)
        const dia = parseInt(data1.substring(8,10),10)
        const result = isBefore(new Date(ano, mes-1, dia), data2)
        return result;
    } catch (err) {
        logError(`ERRO AO CHECAR SE COMPRA DE ${data1} FOI FEITA ANTES DE ${data2.toString()}`, err);
        throw err;
    }
}