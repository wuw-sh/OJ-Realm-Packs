import { Mode } from '../types/index';
export class Database {
    constructor(player) {
        this.player = player;
    }
    set(identifier, value) {
        this.player.setDynamicProperty(identifier, value);
    }
    get(identifier) {
        if (!this.has(identifier))
            return null;
        const data = this.player.getDynamicProperty(identifier);
        return (identifier === Mode.coordinatorToggle || identifier === Mode.coordinatorNotificationToggle) ? Boolean(data) : JSON.parse(String(data));
    }
    has(identifier) {
        try {
            const data = this.player.getDynamicProperty(identifier);
            if (data === undefined)
                return false;
            return true;
        }
        catch (e) {
            return false;
        }
    }
    clear(identifier) {
        return this.set(identifier, JSON.stringify({}));
    }
}
