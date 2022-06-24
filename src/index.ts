import { getMessage } from './utils'
import {test} from './hero'
export async function sayMessage() {
    await test();
}

sayMessage();
