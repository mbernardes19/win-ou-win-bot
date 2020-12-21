import axios from 'axios';

export default class HttpService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async get(path: string, headers?: any, params?: any) {
        return await axios.get(this.baseUrl + path, {
            headers,
            params,
            timeout: 30000
        });
    }

    async post(path: string, data: any, headers?: any) {
        return await axios.post(this.baseUrl + path, data, {
            headers,
            timeout: 30000
        })
    }
}