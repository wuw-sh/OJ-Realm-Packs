import { ItemStack, MinecraftItemTypes, world, ItemLockMode, system } from "@minecraft/server";
import { tagUpdate } from "./listeners";
world.beforeEvents.itemUse.subscribe(data => {
    const it = data.itemStack;
    if (it.typeId !== 'minecraft:nether_star')
        return;
    data.cancel = true;
    const pl = data.source;
    system.run(() => {
        pl.teleport({ x: 0.5, y: 50, z: 0.5 }, { rotation: { x: 0, y: 0 } });
    });
});
tagUpdate((player, tag, cause) => {
    const inv = player.getComponent('inventory').container;
    if (cause === 'add' && tag === 'practice') {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item || item.typeId !== 'minecraft:nether_star')
                continue;
            inv.setItem(i);
        }
    }
    else if (cause === 'remove' && tag === 'practice') {
        const item = new ItemStack(MinecraftItemTypes.netherStar);
        item.nameTag = 'Return To Lobby';
        item.lockMode = ItemLockMode.slot;
        inv.setItem(4, item);
    }
});
