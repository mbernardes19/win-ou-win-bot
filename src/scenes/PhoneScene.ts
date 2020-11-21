import { BaseScene, Extra, Markup } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const phoneScene = new BaseScene('phone');

phoneScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return ctx.scene.enter('welcome', ctx.scene.state)
})

phoneScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

phoneScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

phoneScene.enter(async (ctx) => {
    if (!ctx.scene.session.state['phone']) {
        return await askForPhone(ctx);
    }
    await askForPhoneAgain(ctx);
});

const askForPhone = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu telefone com DDD?');
}

const askForPhoneAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
}

phoneScene.use(async (ctx) => {
    await confirmPhone(ctx);
    await savePhoneNumber(ctx.message.text.replace(/ /g, ""), ctx);
});

const confirmPhone = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu telefone é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_phone', ctx.scene.state);
}

const savePhoneNumber = async (phone, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, phone};
    log(`Número de telefone definido ${phone}`);
}

const confirmPhoneScene = new BaseScene('confirm_phone');

confirmPhoneScene.action('sim', async (ctx) => {
    const telefone = ctx.scene.session.state['phone'];
    const validation = validate('telefone', telefone);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('phone', ctx.scene.state);
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('email', ctx.scene.state);
});

confirmPhoneScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('phone', ctx.scene.state);
});

confirmPhoneScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const telefone = ctx.scene.session.state['phone'];
        const validation = validate('telefone', telefone);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('phone', ctx.scene.state);
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('email', ctx.scene.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('phone', ctx.scene.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { phoneScene, confirmPhoneScene };
