import * as server from '@minecraft/server';
import { Database, Mode } from './data/data';
const events = server.world.beforeEvents;
const Items = {
    enable: {
        typeId: 'minecraft:slime_ball'
    },
    disable: {
        typeId: 'minecraft:magma_cream'
    },
    returner: {
        typeId: 'minecraft:prismarine_shard'
    },
    cordinator: {
        typeId: 'minecraft:compass'
    }
};
const getInv = (inv, itemType) => [...Array(inv.size).keys()].map(i => inv.getItem(i)).map((it, slot) => !it ? null : { typeId: it.typeId, name: it.nameTag, slot: slot }).filter(it => it !== null && it.typeId == itemType.typeId);
const clearPracItem = (pl) => {
    const inv = pl.getComponent('inventory').container;
    const items = getInv(inv, Items["enable"]);
    items.forEach(it => it ? inv.setItem(it.slot) : void 0);
    const rtn = getInv(inv, Items["returner"]);
    rtn.forEach(it => it ? inv.setItem(it.slot) : void 0);
    const dis = getInv(inv, Items["disable"]);
    dis.forEach(it => it ? inv.setItem(it.slot) : void 0);
};
const coordDisableActionbar = (pl) => {
    server.system.run(() => {
        pl.onScreenDisplay.setActionBar('§cCoordinates display disabled');
    });
};
const checkWrong = (pl) => {
    const v = pl.getVelocity();
    const speed = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    return speed >= 0.1 || (pl.isClimbing && !pl.isOnGround) || !pl.isOnGround;
};
events.itemUse.subscribe(data => {
    const pl = data.source;
    if (!(pl instanceof server.Player))
        return;
    const it = data.itemStack;
    const db = new Database(pl);
    const practiceData = db.get(Mode.practiceData);
    const inv = pl.getComponent('inventory').container;
    const checkItem = (ItemType) => it.typeId == ItemType.typeId;
    if (!practiceData.toggle && checkItem(Items.enable)) {
        server.system.run(() => {
            if (checkWrong(pl))
                return pl.sendMessage('§cYou can\'t enable practice mode while moving or climbing');
            pl.sendMessage('§aPractice mode enabled');
            pl.addTag('practice');
            const rot = pl.getRotation();
            const pracData = { toggle: true, location: pl.location, rotation: { x: rot.x, y: rot.y } };
            db.set(Mode.practiceData, JSON.stringify(pracData));
            clearPracItem(pl);
            const disable = new server.ItemStack(server.ItemTypes.get(Items.disable.typeId));
            inv.setItem(pl.selectedSlot, disable);
        });
    }
    else if (practiceData.toggle && checkItem(Items.disable)) {
        server.system.run(() => {
            pl.sendMessage('§cPractice mode disabled');
            pl.removeTag('practice');
            const cp = practiceData;
            if (!cp)
                return pl.sendMessage('§cCheckpoint not found');
            pl.teleport(cp.location, { dimension: pl.dimension, rotation: cp.rotation });
            db.set(Mode.practiceData, JSON.stringify({ toggle: false, location: null, rotation: null }));
            clearPracItem(pl);
            const enable = new server.ItemStack(server.ItemTypes.get(Items.enable.typeId));
            inv.setItem(pl.selectedSlot, enable);
        });
    }
    else if (practiceData.toggle && checkItem(Items.returner)) {
        const cp = practiceData;
        if (!cp)
            return pl.sendMessage('§cCheckpoint not found');
        server.system.run(() => {
            pl.teleport(cp.location, { dimension: pl.dimension, rotation: cp.rotation });
        });
    }
    else if (checkItem(Items.cordinator)) {
        if (db.get(Mode.cordinatorToggle)) {
            db.set(Mode.cordinatorToggle, false);
            coordDisableActionbar(pl);
            pl.sendMessage('§cCoordinates display disabled');
        }
        else {
            db.set(Mode.cordinatorToggle, true);
            pl.sendMessage('§aCoordinates display enabled');
        }
    }
});
server.system.runInterval(() => {
    server.world.getAllPlayers().forEach(pl => {
        const db = new Database(pl);
        if (!db.get(Mode.cordinatorToggle))
            return;
        const pos = Object.values(pl.location).map(pos => Number(pos.toFixed(2)));
        let rot = pl.getRotation();
        rot = { x: Number(rot.x.toFixed(2)), y: Number(rot.y.toFixed(2)) };
        pl.onScreenDisplay.setActionBar(`X: ${pos[0]} Y: ${pos[1]} Z: ${pos[2]}\nYaw: ${rot.y} Pitch: ${rot.x}`);
    });
});
server.system.beforeEvents.watchdogTerminate.subscribe(watchDog => {
    watchDog.cancel = true;
});
