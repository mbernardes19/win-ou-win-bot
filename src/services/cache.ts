import NodeCache from 'node-cache';
import UserData from '../model/UserData';

export default class CacheService {
    private static cache = new NodeCache();
    static user: UserData|any = {
        telegramId: '',
        discountCouponId: '',
        username: '',
        paymentMethod: '',
        plano: '',
        fullName: '',
        phone: '',
        email: '',
        dataAssinatura: ''
    }

    static saveFullName(fullName: string) {
        this.user.fullName = fullName;
    }

    static getFullName() {
        return this.user.fullName;
    }

    static saveDataAssinatura(dataAssinatura: string) {
        this.user.dataAssinatura = dataAssinatura;
    }

    static getDataAssinatura() {
        return this.user.dataAssinatura;
    }

    static saveUsername(username: string) {
        this.user.username = username;
    }

    static getUsername() {
        return this.user.username;
    }

    static getPlano() {
        return this.user.plano;
    }

    static savePlano(plano: string) {
        this.user.plano = plano;
    }

    static getPhone() {
        return this.user.phone;
    }

    static savePhone(phone: string) {
        this.user.phone = phone;
    }

    static getEmail() {
        return this.user.email;
    }

    static saveEmail(email: string) {
        this.user.email = email;
    }

    static getPaymentMethod() {
        return this.user.paymentMethod;
    }

    static savePaymentMethod(paymentMethod: string) {
        this.user.paymentMethod = paymentMethod;
    }

    static saveDiscountId(discountId: string) {
        this.user.discountCouponId = discountId;
    }

    static getDiscountId() {
        return this.user.discountCouponId;
    }

    static saveTelegramId(telegramId: string) {
        this.user.telegramId = telegramId;
    }

    static getTelegramId() {
        return this.user.telegramId;
    }

    static saveUserData(key: string, value: any) {
        this.save(key, value);
    }

    static save(key: string, value: any) {
        this.cache.set(key, value);
    }

    static saveToken(value: string) {
        this.cache.set('token', value, 900);
    }

    static get<T>(key: string) {
        return this.cache.get<T>(key);
    }

    static showAllKeys() {
        return this.cache.keys()
    }

    static clearAllUserData() {
        this.user = {};
    }

}