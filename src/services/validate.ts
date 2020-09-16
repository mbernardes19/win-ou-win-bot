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
const silver = (ctx) => ctx.message ? PLANO.SILVER.test(ctx.message.text) : PLANO.SILVER.test(ctx.update.message.text);
const gold = (ctx) => ctx.message ? PLANO.GOLD.test(ctx.message.text) : PLANO.GOLD.test(ctx.update.message.text);
const diamond = (ctx) => ctx.message ? PLANO.DIAMOND.test(ctx.message.text) : PLANO.DIAMOND.test(ctx.update.message.text);
const blackDiamond = (ctx) => ctx.message ? PLANO.BLACK_DIAMOND.test(ctx.message.text) : PLANO.BLACK_DIAMOND.test(ctx.update.message.text);
const confirmado = (ctx) => ctx.message ? SIM.test(ctx.message.text) : SIM.test(ctx.update.message.text);
const negado = (ctx) => ctx.message ? NAO.test(ctx.message.text) : NAO.test(ctx.update.message.text);

export { formaDePagamentoValida, cartao, boleto, confirmado, negado, silver, gold, diamond, blackDiamond, validate }
