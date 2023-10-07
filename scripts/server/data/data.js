import * as server from '@minecraft/server';
export var Mode;
(function (Mode) {
    Mode["practiceData"] = "practiceData";
    Mode["coordinatorConfig"] = "coordinatorConfig";
    Mode["coordinatorToggle"] = "coordinatorToggle";
    Mode["coordinatorNotificationToggle"] = "coordinatorNotificationToggle";
})(Mode || (Mode = {}));
export class Database {
    constructor(player) {
        this.player = player;
    }
    set(identifier, value) {
        this.player.setDynamicProperty(identifier, value);
    }
    get(identifier) {
        if (!this.has(identifier))
            return false;
        const res = this.player.getDynamicProperty(identifier);
        return (identifier === Mode.coordinatorToggle || identifier === Mode.coordinatorNotificationToggle) ? Boolean(res) : JSON.parse(String(res));
    }
    has(identifier) {
        try {
            this.player.getDynamicProperty(identifier);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    clear(identifier) {
        return this.set(identifier, '');
    }
}
server.world.afterEvents.worldInitialize.subscribe(initData => {
    const def = new server.DynamicPropertiesDefinition();
    def.defineString(Mode.coordinatorConfig, 255);
    def.defineString(Mode.practiceData, 255);
    def.defineBoolean(Mode.coordinatorToggle);
    def.defineBoolean(Mode.coordinatorNotificationToggle);
    initData.propertyRegistry.registerEntityTypeDynamicProperties(def, 'minecraft:player');
});
