import { LocationStatus } from "@ulixee/hero-playground";
const Hero = require('@ulixee/hero-playground');

export async function test() {
    // connection established here
    const hero = await new Hero();
    await hero.goto('https://play.esea.net/users/2742648');
    const activeTab = await hero.getActiveTab();
    await activeTab.waitForLoad(LocationStatus.DomContentLoaded);
    const title = await hero.document.title;
    const intro = await hero.document.querySelector('.eNlNUK').textContent;
    await hero.close();
    console.log(title, intro);
};
