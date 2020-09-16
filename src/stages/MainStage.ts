import { Stage } from 'telegraf';
import welcomeScene from '../scenes/WelcomeScene';
import paymentScene from '../scenes/PaymentScene';
import planoScene from '../scenes/PlanoScene';
import { nameScene, confirmNameScene } from '../scenes/NameScene';
import { phoneScene, confirmPhoneScene } from '../scenes/PhoneScene';
import { emailScene, confirmEmailScene } from '../scenes/EmailScene';
import analysisScene from '../scenes/AnalysisScene';

const stage = new Stage([
    welcomeScene,
    paymentScene,
    planoScene,
    nameScene,
    confirmNameScene,
    phoneScene,
    confirmPhoneScene,
    emailScene,
    confirmEmailScene,
    analysisScene
], { ttl: 1500 });

export default stage;