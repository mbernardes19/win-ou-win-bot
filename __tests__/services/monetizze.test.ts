import { verifyUserPurchase } from '../../src/services/monetizze';
import {getMonetizzeProductTransaction} from '../../src/services/request'
import { MonetizzeTransactionResponse, MonetizzeTrasactionOptions } from '../../src/interfaces/Monetizze';
import baseMockedDadosRequest from '../../__mocks__/requestData';
jest.mock('../../src/services/request')

const mockedMonetizzeProductTransaction = getMonetizzeProductTransaction as jest.MockedFunction<(options: MonetizzeTrasactionOptions) => Promise<MonetizzeTransactionResponse>>

describe('Monetizze Service', () => {
    it('should verify finalized purchase', async () => {
        // Given
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "1", pages: 1, error: "null"}))
        // When
        const verification = await verifyUserPurchase('teste@email.com');

        // Then
        expect(verification).toBe(true);
    })

    it('should verify completed purchase', async () => {
        // Given
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "0", pages: 1, error: "null"}))
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "1", pages: 1, error: "null"}))
        // When
        const verification = await verifyUserPurchase('teste@email.com');

        // Then
        expect(verification).toBe(true)
    })

    it('should verify non existing purchase', async () => {
        // Given
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "0", pages: 1, error: "null"}))
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "0", pages: 1, error: "null"}))
        // When
        const verification = await verifyUserPurchase('teste@email.com');

        // Then
        expect(verification).toBe(false)
    })

    it('should verify existing finalized purchase with invalid subscription', async () => {
        // Given
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[
                    {
                        ...baseMockedDadosRequest,
                        assinatura: {
                            codigo: '123',
                            data_assinatura: '34',
                            status: 'Inadimplente',
                            parcela: 1
                        }
                    }
                ], recordCount: "1", pages: 1, error: "null"}))
        // When
        const verification = await verifyUserPurchase('teste@email.com');

        // Then
        expect(verification).toBe(false)
    })

    it('should verify existing completed purchase with invalid subscription', async () => {
        // Given
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[{...baseMockedDadosRequest}
                ], recordCount: "0", pages: 1, error: "null"}))
        mockedMonetizzeProductTransaction.mockImplementationOnce(
            () => Promise.resolve({
                dados:[
                    {
                        ...baseMockedDadosRequest,
                        assinatura: {
                            codigo: '123',
                            data_assinatura: '34',
                            status: 'Inadimplente',
                            parcela: 1
                        }
                    }
                ], recordCount: "1", pages: 1, error: "null"}))
        // When
        const verification = await verifyUserPurchase('teste@email.com');

        // Then
        expect(verification).toBe(false)
    })
})