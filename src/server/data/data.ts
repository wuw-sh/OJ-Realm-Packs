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
    set(identifier: string, value: string | number | boolean): void {
        this.player.setDynamicProperty(identifier, value);
    }
    get(identifier: string): any {
        if (!this.has(identifier)) return null;
        const data = this.player.getDynamicProperty(identifier);
        return (identifier === Mode.coordinatorToggle || identifier === Mode.coordinatorNotificationToggle) ? Boolean(data) : JSON.parse(String(data));
    }
    has(identifier: string): boolean {
        try {
            const data = this.player.getDynamicProperty(identifier);
            if (data === undefined) return false;
            return true;
        } catch (e) {
            return false;
        }
    }
    clear(identifier: string): void {
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