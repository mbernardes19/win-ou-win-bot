import { getMonetizzeProductTransaction } from './request';
import { log, logError } from '../logger';
import CacheService from './cache';
import User from '../model/User';
import { MonetizzeTransactionResponse } from '../interfaces/Monetizze'

const getDiscountCouponIdFromUser = async (userEmail, userPlano) => {
    log(`Pegando cupom de desconto de usuário ${userEmail}`)
    try {
        const transaction = await getMonetizzeProductTransaction({ email: userEmail })
        log(`Pegando cupom de desconto do usuário na Monetizze`);
        const transactionFromPlano = transaction.dados.filter(dado => dado.venda.plano === userPlano);
        return transactionFromPlano[0].venda.cupom !== null ? transactionFromPlano[0].venda.cupom : '0';
    } catch (err) {
        logError(`ERRO AO PEGAR CUPOM DE DESCONTO DO USUÁRIO ${userEmail}`, err)
        throw err;
    }
}

const getDataAssinaturaFromUser = async (userEmail: string) => {
    log(`Pegando data de assinatura de usuário ${userEmail}`)
    try {
        const transaction = await getMonetizzeProductTransaction({ email: userEmail })
        log(`Pegando data de assinatura do usuário na Monetizze`);
        const transactionsLength = transaction.dados.length;
        return transaction.dados[transactionsLength-1].venda.dataInicio;
    } catch (err) {
        logError(`ERRO AO PEGAR DATA DE ASSINATURA DO USUÁRIO ${userEmail}`, err)
        throw err;
    }
}

const verifyUserPurchase = async (email) => {
    try {
        log(`Verificando compra de usuário na Monetizze ${email}`)
    //     const responseFinalizada = await getMonetizzeProductTransaction({ email, "status[]": 2 })
    //     if (responseFinalizada.recordCount === "0") {
    //         log(`${email} não tem compras finalizadas`)
    //         const responseCompleta = await getMonetizzeProductTransaction({ email, "status[]": 6 })
    //         if (responseCompleta.recordCount === "0") {
    //             log(`${email} não tem compras completas`)
    //             return false;
    //         }
    //         if (responseCompleta.dados[0].assinatura && responseCompleta.dados[0].assinatura.status !== 'Ativa') {
    //             log(`${email} tem compra completa, mas assinatura não está ativa`)
    //             return false;
    //         }
    //         log(`${email} tem compra completa e com assinatura ativa!`)
    //         return true;
    //    }
    //    if (responseFinalizada.dados[0].assinatura && responseFinalizada.dados[0].assinatura.status !== 'Ativa') {
    //        log(`${email} tem compra finalizada, mas assinatura não está ativa`)
    //        return false;
    //    }
    //    log(`${email} tem compra finalizada e com assinatura ativa!`)
       return true;
    } catch (err) {
        logError(`ERRO AO VERIFICAR COMPRA DE ${email}`, err)
        throw err
    }
}

const confirmPlano = async (email) => {
    try {
        log(`Confirmando plano de usuário na Monetizze ${email}`)
        const responseCompletas = await getMonetizzeProductTransaction({ email })
        return responseCompletas.dados[0].plano.codigo !== CacheService.getPlano() ? false : true;
    } catch (err) {
        logError(`ERRO AO VERIFICAR PLANO NA COMPRA DE ${email}`, err)
        throw err
    }
}

const checkIfPaymentMethodIsBoleto = async (email) => {
    try {
        log(`Verificando se a compra na Monetizze de ${email} foi feita por boleto e está aguardando pagamento`)
        const response = await getMonetizzeProductTransaction({ email, "forma_pagamento[]": 3, "status[]": 1 })
        return response.recordCount === "0" ? false : true;
    } catch (err) {
        throw err;
    }
}

const getUsersNewStatusAssinatura = async (users: User[]) => {
    log(`Pegando novos status de assinatura para usuários ${users}`)
    const usersToUpdatePromise = [];
    users.forEach(user => {
        const { email } = user.getUserData();
        usersToUpdatePromise.push(getMonetizzeProductTransaction({email}))
    })
    try {
        const usersToUpdate: MonetizzeTransactionResponse[] = await Promise.all(usersToUpdatePromise)
        return usersToUpdate.map(user => user.dados[0].assinatura.status.toString().toLowerCase().replace(/' '/g, '_'))
    } catch (err) {
        logError(`ERRO AO PEGAR NOVO STATUS DE ASSINATURA DE USUÁRIOS ${users}`, err);
        throw err;
    }
}

export { getDiscountCouponIdFromUser, verifyUserPurchase, confirmPlano, getDataAssinaturaFromUser, checkIfPaymentMethodIsBoleto, getUsersNewStatusAssinatura }
