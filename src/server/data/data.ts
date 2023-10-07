import * as server from '@minecraft/server';
export enum Mode {
    "practiceData" = "practiceData",
    "coordinatorConfig" = "coordinatorConfig",
    "coordinatorToggle" = "coordinatorToggle",
    "coordinatorNotificationToggle" = "coordinatorNotificationToggle"
}
export class Database {
    player: server.Player;
    constructor(player: server.Player) {
        this.player = player;
    }
    set(identifier: string, value: string | number | boolean) {
        this.player.setDynamicProperty(identifier, value);
    }
    get(identifier: string) {
        if (!this.has(identifier))
            return false;
        const res = this.player.getDynamicProperty(identifier);
        return (identifier === Mode.coordinatorToggle || identifier === Mode.coordinatorNotificationToggle) ? Boolean(res) : JSON.parse(String(res));
    }
    has(identifier: string) {
        try {
            this.player.getDynamicProperty(identifier);
            return true;
        } catch (e) {
            return false;
        }
    }
    clear(identifier: string) {
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
