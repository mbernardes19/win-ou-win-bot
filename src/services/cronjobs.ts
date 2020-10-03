import Cron from 'node-cron';
import { getAllInvalidNonKickedUsers, getAllUsers, markUserAsKicked, getAllValidUsers, updateUsersStatusAssinatura } from '../dao';
import { connection } from '../db';
import CacheService from './cache';
import { Telegram } from 'telegraf';
import { getChat } from './chatResolver';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';
import { createCsvFile } from './csv';
import { sendReportToEmail } from './email';

const startCronJobs = () => {
    try {
        removeInvalidUsers();
        updateValidUsersStatusAssinatura();
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

        invalidUsers.forEach((invalidUser, index) => {
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_WIN_30, invalidUser.id_telegram));
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_WIN_VIP, invalidUser.id_telegram));
            usersToKick.push(telegramClient.kickChatMember(process.env.ID_CANAL_WIN_MIX, invalidUser.id_telegram));
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