import * as server from '@minecraft/server';
export var Mode;
(function (Mode) {
    Mode["practiceData"] = "practiceData";
    Mode["cordinatorToggle"] = "cordinatorToggle";
})(Mode || (Mode = {}));
export class Database {
    constructor(player) {
        this.player = player;
    }
    set(identifier, value) {
        this.player.setDynamicProperty(identifier, value);
    }
    get(identifier) {
        if (!this.player.getDynamicProperty(identifier) || 0)
            return false;
        const res = this.player.getDynamicProperty(identifier);
        return identifier === Mode.practiceData ? JSON.parse(String(res)) : Boolean(res);
    }
}
server.world.afterEvents.worldInitialize.subscribe(initData => {
    const def = new server.DynamicPropertiesDefinition();
    def.defineString(Mode.practiceData, 255);
    def.defineBoolean(Mode.cordinatorToggle);
    initData.propertyRegistry.registerEntityTypeDynamicProperties(def, 'minecraft:player');
});
