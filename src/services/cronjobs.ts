import Cron from 'node-cron';
import { getAllInvalidNonKickedUsers, getAllUsers, markUserAsKicked, getAllValidUsers, updateUsersStatusAssinatura, updateUsersDiasAteFimAssinatura, getAllValidUsersWithPaymentBoleto } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';
import User from '../model/User';
import { createCsvFile } from './csv';
import { sendReportToEmail } from './email';

const startCronJobs = () => {
    try {
        removeInvalidUsers();
        updateValidUsersStatusAssinatura();
        updateValidUsersDiasAteFimAssinatura();
        sendCsvReportToEmail();
    } catch (err) {
        logError(`ERRO AO EXECUTAR CRONJOB`, err)
    }
}

const removeInvalidUsers = () => {
    const each15Minutes = '*/15 * * * *';
    const telegramClient = CacheService.get<Telegram>('telegramClient');

    Cron.schedule(each15Minutes, async () => {
        log(`⏱️ Iniciando cronjob para remover usuários inválidos`)
        const usersToKick = []
        const chatIdsPromises = []

        let invalidUsers;
        try {
            invalidUsers = await getAllInvalidNonKickedUsers(connection);
            log(`⏱️ Pegando usuários inválidos ${invalidUsers}`)
        } catch (err) {
            throw err;
        }
        invalidUsers.forEach(invalidUser => {
            chatIdsPromises.push(getChat(invalidUser.plano, invalidUser.data_assinatura))
        })

        let chatIds;
        try {
            chatIds = await Promise.all(chatIdsPromises);
            log(`⏱️ Pegando chats com usuários inválidos ${chatIds}`)
        } catch (err) {
            logError(`⏱️ ERRO AO PEGAR CHATS COM USUÁRIOS INVÁLIDOS ${invalidUsers}`, err)
            await enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO PEGAR CHATS COM USUÁRIOS INVÁLIDOS ${invalidUsers}`, err);
            throw err;
        }

        invalidUsers.forEach((invalidUser, index) => {
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_GERAL, invalidUser.id_telegram));
            usersToKick.push(telegramClient.kickChatMember(chatIds[index][1], invalidUser.id_telegram));
            usersToKick.push(markUserAsKicked(invalidUser.id_telegram, connection))
        })

        try {
            await Promise.all(usersToKick);
            log(`⏱️ Usuários inválidos removidos ${usersToKick}`)
        } catch (err) {
            logError(`⏱️ ERRO AO REMOVER USUÁRIOS INVÁLIDOS ${usersToKick}`, err)
            await enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO REMOVER USUÁRIOS INVÁLIDOS ${usersToKick}`, err)
            throw err;
        }
    });
}

const updateValidUsersStatusAssinatura = () => {
    const eachHour = '0 */1 * * *';

    Cron.schedule(eachHour, async () => {
        log(`⏱️ Iniciando cronjob para atualizar status de assinatura de usuários válidos`)

        let allUsers = [];
        try {
            allUsers = await getAllValidUsers(connection);
            await updateUsersStatusAssinatura(allUsers, connection);
        } catch (err) {
            logError(`⏱️ ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS VÁLIDOS ${allUsers}`, err)
            enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS VÁLIDOS ${allUsers}`, err)
            throw err;
        }
    });
}

const updateValidUsersDiasAteFimAssinatura = async () => {
    const eachDayAt8AM = '0 8 * * *';
    const test = '* * * * *';

    Cron.schedule(eachDayAt8AM, async () => {
        log(`⏱️ Iniciando cronjob para atualizar dias até fim de assinatura de usuários válidos`)

        let allUsers = [];
        try {
            allUsers = await getAllValidUsers(connection);
            await updateUsersDiasAteFimAssinatura(allUsers, connection);
            const allUsersUpdated = await getAllValidUsersWithPaymentBoleto(connection);
            await sendMessageToUsersCloseToEndAssinatura(allUsersUpdated)
        } catch (err) {
            logError(`ERRO AO ATUALIZAR DIAS ATÉ FIM DE ASSINATURA DE USUÁRIOS ${allUsers}`, err);
            enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO ATUALIZAR DIAS ATÉ FIM DE ASSINATURA DE USUÁRIOS VÁLIDOS ${JSON.stringify(allUsers)}`, err)
            throw err;
        }
    })
}

const sendMessageToUsersCloseToEndAssinatura = async (users: User[]) => {
    const mensagemAviso = (dias) => `Olá! Acabei de verificar que daqui a ${dias} dia(s) seu plano vai expirar.\n\nSe você quer continuar lucrando com a família Método Trader Infalível tendo acesso ao curso completo, lista de sinais diária, operações ao vivo e sinais em tempo real, acesse agora seu email para verificar ou acesse direto a Monetizze e gere seu boleto.\n\nQualquer dúvida chame um dos suportes abaixo ⤵️`
    const telegramClient = CacheService.get<Telegram>('telegramClient');
    const usersCloseToEndAssinatura = users.filter(user => user.getUserData().diasAteFimDaAssinatura <= 3)
    const actions = []
    usersCloseToEndAssinatura.forEach(user => {
        if (user.getUserData().diasAteFimDaAssinatura === 3) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, mensagemAviso(3), {reply_markup: {inline_keyboard: [[{text: '👉 SUPORTE 1', url:'t.me/juliasantanana'}], [{text: '👉 SUPORTE 2', url: 't.me/diego_sti'}], [{text: '👉 SUPORTE 3', url: 't.me/julianocba'}]]}}))
        }
        if (user.getUserData().diasAteFimDaAssinatura === 2) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, mensagemAviso(2), {reply_markup: {inline_keyboard: [[{text: '👉 SUPORTE 1', url:'t.me/juliasantanana'}], [{text: '👉 SUPORTE 2', url: 't.me/diego_sti'}], [{text: '👉 SUPORTE 3', url: 't.me/julianocba'}]]}}))
        }
        if (user.getUserData().diasAteFimDaAssinatura === 1) {
            actions.push(telegramClient.sendMessage(user.getUserData().telegramId, mensagemAviso(1), {reply_markup: {inline_keyboard: [[{text: '👉 SUPORTE 1', url:'t.me/juliasantanana'}], [{text: '👉 SUPORTE 2', url: 't.me/diego_sti'}], [{text: '👉 SUPORTE 3', url: 't.me/julianocba'}]]}}))
        }
    })
};

const sendCsvReportToEmail = () => {
    const eachDayAt9AM = '0 9 * * *';
    const header = ['Id Telegram', 'User Telegram', 'Plano', 'Cupom Desconto', 'Nome Completo', 'Telefone', 'Email', 'Forma de Pagamento', 'Data Assinatura', 'Status Assinatura', 'Dias Ate Fim Assinatura', 'Kickado', 'Ver Canais']

    Cron.schedule(eachDayAt9AM, async () => {
        log(`⏱️ Iniciando cronjob para enviar relatório diário de usuários por email`)
        try {
            const allUsers = await getAllUsers(connection);
            await createCsvFile(header, allUsers, 'usuarios.csv');
            log(`⏱️ Relatório de usuários criado com sucesso!`)
            await sendReportToEmail()
            log(`⏱️ Relatório de usuários enviado por email com sucesso!`)
        } catch (err) {
            logError(`⏱️ ERRO AO ENVIAR RELATÓRIO DIÁRIO DE USUÁRIOS`, err);
            enviarMensagemDeErroAoAdmin(`⏱️ ERRO AO ENVIAR RELATÓRIO DIÁRIO DE USUÁRIOS}`, err)
            throw err;
        }
    });
}

export { startCronJobs }