import { clearUsersTable, addUserToDatabase, getUserByTelegramId } from '../../src/dao';
import User from '../../src/model/User';
import UserData from '../../src/model/UserData';
import { Connection } from 'mysql';
import mysql from 'mysql';
import dotEnv from 'dotenv';
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '..', '.env')});

const connection: Connection = mysql.createConnection(
    {
        host: process.env.DB_TEST_HOST,
        port: 3306,
        database: process.env.DB_TEST_DATABASE,
        user: process.env.DB_TEST_USER,
        password: process.env.DB_TEST_PASSWORD,
        dateStrings: true
    }
)

describe('User DB operations', () => {
    beforeEach(async () => {
        await clearUsersTable(connection);
    });

    it('should save user in DB', async () => {
        // Given
        const userData: UserData = {
            telegramId: '12313',
            discountCouponId: '0',
            username: 'teste',
            paymentMethod: 'cartao_de_credito',
            plano: 'Teste1',
            fullName: 'Teste',
            phone: '21997532998',
            email: 'asdas@asd.com',
            dataAssinatura:  '2020-03-02',
            statusAssinatura: 'ativa',
            diasAteFimDaAssinatura: 0
        }
        const user = new User(userData);

        // When
        await addUserToDatabase(user, connection)

        // Then
        const addedUser = await getUserByTelegramId(userData.telegramId, connection)
        console.log(addedUser)
        expect(addedUser.id_telegram).toBe(12313)
        expect(addedUser.cupom_desconto).toBe(0)
        expect(addedUser.user_telegram).toBe('teste')
        expect(addedUser.forma_de_pagamento).toBe('cartao_de_credito')
        expect(addedUser.plano).toBe('Teste1')
        expect(addedUser.nome_completo).toBe('Teste')
        expect(addedUser.telefone).toBe('21997532998')
        expect(addedUser.email).toBe('asdas@asd.com')
        expect(addedUser.data_assinatura).toBe('2020-03-02')
        expect(addedUser.status_assinatura).toBe('ativa')
        expect(addedUser.dias_ate_fim_assinatura).toBe(0)
    })
})