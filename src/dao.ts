import util from 'util';
import { Connection } from 'mysql';
import User from './model/User';
import { getUsersNewStatusAssinatura } from './services/monetizze';
import { log, logError } from './logger';
import { pegarDiasSobrandoDeAssinatura } from './services/diasAssinatura';
import EduzzService from './services/eduzz';
import { EduzzAuthCredentials } from './interfaces/Eduzz';

const clearUsersTable = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        await query(`truncate Users`)
    } catch (err) {
        throw err
    }
}


const addUserToDatabase = async (user: User, connection: Connection) => {
    const userData = user.getUserData();
    const { telegramId, username, fullName, plano, discountCouponId, phone, email, paymentMethod, dataAssinatura, diasAteFimDaAssinatura } = userData;
    const query = util.promisify(connection.query).bind(connection)
    try {
        await query(`insert into Users (id_telegram, user_telegram, plano, cupom_desconto, nome_completo, telefone, email, forma_de_pagamento, data_assinatura, status_assinatura, dias_ate_fim_assinatura) values ('${telegramId}', '${username}', '${plano}', '${discountCouponId}', '${fullName}', '${phone}', '${email}', '${paymentMethod}', '${dataAssinatura}', 'ativa', '${diasAteFimDaAssinatura}')`)
    } catch (err) {
        throw err
    }
}

const getUserByTelegramId = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const result = await query(`select * from Users where id_telegram='${telegramId}'`);
        return result[0];
    } catch (err) {
        logError(`ERRO AO PEGAR USUÁRIO DO BANCO DE DADOS POR ID ${telegramId}`, err);
        throw err
    }
}

const getAllValidUsers = async (connection: Connection): Promise<User[]> => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const dbResults = await query(`select * from Users where status_assinatura = 'ativa' and kickado = 'N'`);
        const users: User[] = dbResults.map(dbResult => User.fromDatabaseResult(dbResult))
        return users;
    } catch (err) {
        logError(`ERRO AO PEGAR TODOS OS USUÁRIOS VÁLIDOS DO BANCO DE DADOS`, err);
        throw err;
    }
}

const getAllValidUsersWithPaymentBoleto = async (connection: Connection): Promise<User[]> => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const dbResults = await query(`select * from Users where status_assinatura = 'ativa' and kickado = 'N' and forma_de_pagamento='boleto'`);
        const users: User[] = dbResults.map(dbResult => User.fromDatabaseResult(dbResult))
        return users;
    } catch (err) {
        logError(`ERRO AO PEGAR TODOS OS USUÁRIOS VÁLIDOS DO BANCO DE DADOS`, err);
        throw err;
    }
}

const getAllUsers = async (connection: Connection): Promise<any[]> => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const dbResults = await query(`select * from Users`);
        return dbResults;
    } catch (err) {
        logError(`ERRO AO PEGAR TODOS OS USUÁRIOS DO BANCO DE DADOS`, err);
        throw err;
    }
}

const getAllInvalidNonKickedUsers = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`select * from Users where not status_assinatura='ativa' and kickado='N'`);
    } catch (err) {
        logError(`ERRO AO PEGAR TODOS OS USUÁRIOS INVÁLIDOS NÃO KICKADOS DO BANCO DE DADOS`, err);
        throw err;
    }
}

const getAllInvalidUsers = async (connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        return await query(`select * from Users where not status_assinatura='ativa'`);
    } catch (err) {
        logError(`ERRO AO PEGAR TODOS OS USUÁRIOS INVÁLIDOS DO BANCO DE DADOS`, err);
        throw err;
    }
}

const updateUsersStatusAssinatura = async (users: User[], connection: Connection) => {
    log(`Iniciando atualização de status de usuários ${users}`)
    const eduzzService = new EduzzService();
    const authCredentials: EduzzAuthCredentials = {email: 'contato.innovatemarketing@gmail.com', publicKey: '98057553', apiKey: '6d6f195185'}
    await eduzzService.authenticate(authCredentials);
    const query = util.promisify(connection.query).bind(connection);
    let newStatusAssinatura;
    try {
        newStatusAssinatura = await eduzzService.getUsersNewStatusAssinatura(users);
    } catch (err) {
        throw err;
    }

    const updates = []
    users.forEach((user, index) => {
        updates.push(query(`update Users set status_assinatura='${newStatusAssinatura[index]}' where id_telegram='${user.getUserData().telegramId}'`));
    })
    try {
        await Promise.all(updates);
        log(`Atualização de status realizada com sucesso!`)
    } catch (err) {
        logError(`ERRO AO ATUALIZAR STATUS DE ASSINATURA DE USUÁRIOS ${users}`, err);
        throw err;
    }
}

const updateUsersDiasAteFimAssinatura = async (users: User[], connection: Connection) => {
    log(`Iniciando atualização de dias até fim de assinatura ${users}`)

    const query = util.promisify(connection.query).bind(connection)
    const leftDaysPromise = []
    users.map(user => {
        leftDaysPromise.push(pegarDiasSobrandoDeAssinatura(user.getUserData().plano, user.getUserData().email))
    })

    let leftDays
    try {
        leftDays = await Promise.all(leftDaysPromise)
    } catch (err) {
        logError(`ERRO NA HORA DE PEGAR DIAS QUE FALTAM PARA TERMINAR ASSINATURA DE USUÁRIOS ${users}`, err)
        throw err;
    }

    const updates = []
    users.map((user, index) => {
        updates.push(query(`update Users set dias_ate_fim_assinatura=${leftDays[index]} where id_telegram='${user.getUserData().telegramId}'`))
    })

    try {
        await Promise.all(updates)
    } catch (err) {
        logError(`ERRO AO ATUALIZAR DIAS ATÉ FIM DE ASSINATURA DE USUÁRIOS ${users}`, err);
        throw err;
    }
}

const markUserAsKicked = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        await query(`update Users set kickado='S' where id_telegram='${telegramId}'`);
        log(`Usuários ${telegramId} marcado como kickado`);
    } catch (err) {
        logError(`ERRO AO MARCAR USUÁRIO COMO KICKADO ${telegramId}`, err);
        throw err;
    }
}

const updateViewChats = async (telegramId: string|number, connection: Connection) => {
    const query = util.promisify(connection.query).bind(connection)
    try {
        const [dbResult] = await query(`select ver_canais from Users where id_telegram='${telegramId}'`);
        const newVerCanais = parseInt(dbResult.ver_canais, 10) + 1;
        await query(`update Users set ver_canais=${newVerCanais} where id_telegram='${telegramId}'`);
    } catch (err) {
        logError(`ERRO AO ATUALIZAR VISUALIZAÇÕES DE CANAIS DE USUÁRIO ${telegramId}`, err);
        throw err;
    }
}

export { addUserToDatabase, clearUsersTable, getAllValidUsersWithPaymentBoleto, getUserByTelegramId, getAllValidUsers, getAllUsers, getAllInvalidUsers, updateUsersStatusAssinatura, updateUsersDiasAteFimAssinatura, markUserAsKicked, getAllInvalidNonKickedUsers, updateViewChats }
