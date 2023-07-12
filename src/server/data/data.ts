import * as server from '@minecraft/server';
export enum Mode {
    "practiceData" = "practiceData",
    "cordinatorToggle" = "cordinatorToggle"
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
    initData.propertyRegistry.registerEntityTypeDynamicProperties(def, server.MinecraftEntityTypes.player);
});