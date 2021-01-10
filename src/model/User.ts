import UserData from './UserData';

export default class User {
    private userData: UserData;

    constructor(userData: UserData) {
        this.userData = userData;
    }

    getUserData(): UserData {
        return this.userData
    }

    static fromDatabaseResult(databaseResult: any): User {
        try {
            let userData: UserData = new UserData();
            const { id_telegram, user_telegram, plano, cupom_desconto, nome_completo, telefone, email, forma_de_pagamento, data_assinatura, status_assinatura, dias_ate_fim_assinatura, plataforma } = databaseResult
            userData.telegramId = id_telegram
            userData.username = user_telegram
            userData.plano = plano
            userData.discountCouponId = cupom_desconto
            userData.fullName = nome_completo
            userData.phone = telefone
            userData.email = email
            userData.paymentMethod = forma_de_pagamento
            userData.dataAssinatura = data_assinatura
            userData.statusAssinatura = status_assinatura
            userData.diasAteFimDaAssinatura = dias_ate_fim_assinatura
            userData.platform = plataforma
            return new User(userData);
        } catch (err) {
            throw err;
        }
    }
}