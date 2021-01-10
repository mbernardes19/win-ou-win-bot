import HttpService from './http';
import { EduzzResponse, EduzzSaleOptions, EduzzSaleStatus, EduzzAuthCredentials } from '../interfaces/Eduzz';
import CoursePlatformService from './coursePlatform';
import { PlanosEduzz } from '../model/Planos';
import User from '../model/User';
import { log } from 'console';
import { logError } from '../logger';

export default class EduzzService extends CoursePlatformService<EduzzSaleOptions, EduzzResponse> {
    private _httpService: HttpService;
    private _jwtToken: string;
    private readonly MIN_DATE = '2020-09-05';

    constructor() {
        super();
        this.platformName = 'Eduzz';
        this._httpService = new HttpService('https://api2.eduzz.com')
    }

    async authenticate(authCredentials: EduzzAuthCredentials) {
        const {email, publicKey, apiKey} = authCredentials;
        let response;
        try {
            response = await this._httpService.post('/credential/generate_token', {email, publickey: publicKey, apikey: apiKey});
            this._jwtToken = response.data.data.token;
        } catch (err) {
            console.log(err);
        }
    }

    async getPurchases(options?: EduzzSaleOptions): Promise<EduzzResponse> {
        const todayDate = new Date().toISOString().match(/.+(?=T)/gm)[0];
        let response;
        try {
            response = await this._httpService.get('/sale/get_sale_list', {'Token': this._jwtToken}, { start_date: this.MIN_DATE, end_date: todayDate, ...options});
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    async verifyUserPurchase(userEmail: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail})
        if (salesResponse.paginator.totalRows > 0) {
            if (salesResponse.data[0].sale_status === EduzzSaleStatus.PAGA) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async confirmProduct(userEmail: string, plano?: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail})
        if (salesResponse.data[0].content_id === parseInt(plano)) {
            return true;
        } else {
            return false;
        }
    }

    async checkIfPaymentMethodIsBoleto(userEmail: string): Promise<boolean> {
        const salesResponse = await this.getPurchases({client_email: userEmail});
        if (salesResponse.data[0] && salesResponse.data[0].sale_payment_method.includes('Boleto')) {
            return true;
        } else {
            return false;
        }
    }

    async getUserSubscriptionDate(userEmail: string) {
        const salesResponse = await this.getPurchases({client_email: userEmail});
        const responseData = salesResponse.data[0]
        const subDate = responseData.date_payment || responseData.date_update || responseData.date_create
        return subDate as any;
    }

    async getUsersNewStatusAssinatura(users: User[]) {
        log(`Pegando novos status de assinatura para usuários ${users}`)
        const usersToUpdatePromise = [];
        users.forEach(user => {
            const { email } = user.getUserData();
            usersToUpdatePromise.push(this.getPurchases({client_email: email}))
        })
        try {
            const usersToUpdate: EduzzResponse[] = await Promise.all(usersToUpdatePromise)
            return usersToUpdate.map(user => {
                if (user.data[0]) {
                    if (user.data[0].sale_status_name === 'Paga') {
                        return 'ativa';
                    }
                    if (user.data[0].sale_status_name === 'Aberta') {
                        return 'ativa';
                    }
                    if (user.data[0].sale_status_name === 'Aguardando Reembolso') {
                        return 'aguardando_reembolso';
                    }
                    if (user.data[0].sale_status_name === 'Cancelada') {
                        return 'cancelada';
                    }
                    if (user.data[0].sale_status_name.includes('Em Rec')) {
                        return 'em_recuperacao';
                    }
                    if (user.data[0].sale_status_name === 'Expirada') {
                        return 'expirada';
                    }
                    if (user.data[0].sale_status_name === 'Reembolsado') {
                        return 'reembolsado';
                    }
                } else {
                    return 'ativa';
                }
            })
        } catch (err) {
            logError(`ERRO AO PEGAR NOVO STATUS DE ASSINATURA DE USUÁRIOS ${users}`, err);
            throw err;
        }
    }
}