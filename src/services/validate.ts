import { TELEFONE, EMAIL, CARTAO, BOLETO, SIM, NAO, PLANO } from '../util/regex';

const validate = (informacao, dado) => {
    switch(informacao) {
        case 'telefone':
            return TELEFONE.test(dado.replace(/ /g, "")) ?
                {temErro: false, mensagemDeErro: ""} :
                {temErro: true, mensagemDeErro: "Telefone inválido. Certifique-se de estar inserindo somente números e o DDD (sem o zero) junto."}
        case 'email':
            return EMAIL.test(dado) ?
                {temErro: false, mensagemDeErro: ""} :
                {temErro: true, mensagemDeErro: "Email inválido. Certifique-se de estar inserindo um email válido."}
        default: return {temErro: false, mensagemDeErro: ""}
    }
}

const formaDePagamentoValida = (ctx) => ctx.message ? CARTAO.test(ctx.message.text) || BOLETO.test(ctx.message.text) : CARTAO.test(ctx.update.message.text) || BOLETO.test(ctx.update.message.text);
const cartao = (ctx) => ctx.message ? CARTAO.test(ctx.message.text) : CARTAO.test(ctx.update.message.text);
const boleto = (ctx) => ctx.message ? BOLETO.test(ctx.message.text) : BOLETO.test(ctx.update.message.text);
const start = (ctx) => ctx.message ? PLANO.START.test(ctx.message.text) : PLANO.START.test(ctx.update.message.text);
const premium = (ctx) => ctx.message ? PLANO.PREMIUM.test(ctx.message.text) : PLANO.PREMIUM.test(ctx.update.message.text);
const master = (ctx) => ctx.message ? PLANO.MASTER.test(ctx.message.text) : PLANO.MASTER.test(ctx.update.message.text);
const confirmado = (ctx) => ctx.message ? SIM.test(ctx.message.text) : SIM.test(ctx.update.message.text);
const negado = (ctx) => ctx.message ? NAO.test(ctx.message.text) : NAO.test(ctx.update.message.text);

export { formaDePagamentoValida, cartao, boleto, confirmado, negado, start, premium, master, validate }
