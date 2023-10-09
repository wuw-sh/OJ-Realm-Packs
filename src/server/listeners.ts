import * as server from "@minecraft/server";
import { Mode } from "./index";

server.world.afterEvents.worldInitialize.subscribe(initData => {
    const def = new server.DynamicPropertiesDefinition();
    def.defineString(Mode.coordinatorConfig, 2 ** 6);
    def.defineString(Mode.practiceData, 2 ** 8);
    def.defineString(Mode.saves, 2 ** 16);
    def.defineBoolean(Mode.coordinatorToggle);
    def.defineBoolean(Mode.coordinatorNotificationToggle);
    initData.propertyRegistry.registerEntityTypeDynamicProperties(def, 'minecraft:player');
});

server.system.beforeEvents.watchdogTerminate.subscribe(watchDog => {
    watchDog.cancel = true;
});
