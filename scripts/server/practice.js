import * as server from '@minecraft/server';
import * as ui from '@minecraft/server-ui';
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
    coordinator: {
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
                return pl.sendMessage('Practice mode§7: §eYou can\'t enable practice mode while moving or climbing');
            pl.sendMessage('Practice mode§7: §aenabled');
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
            pl.sendMessage('Practice mode§7: §cdisabled');
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
    else if (checkItem(Items.coordinator)) {
        db.get(Mode.coordinatorConfig);
        db.get(Mode.coordinatorToggle);
        db.get(Mode.coordinatorNotificationToggle);
        if (pl.isSneaking) {
            if (!db.has(Mode.coordinatorConfig))
                db.set(Mode.coordinatorConfig, JSON.stringify({ positional: 5, rotational: 5 }));
            if (!db.has(Mode.coordinatorNotificationToggle))
                db.set(Mode.coordinatorNotificationToggle, true);
            server.system.run(() => {
                new ui.ModalFormData()
                    .title('Coordinate config')
                    .slider('\n§lDecimal Digits§r\npositional(x/y/z)\n§7- default: 5\n- current', 0, 14, 1, db.get(Mode.coordinatorConfig).positional ?? 5)
                    .slider('rotational(y/p)\n§7- default: 5\n- current', 0, 14, 1, db.get(Mode.coordinatorConfig).rotational ?? 5)
                    .toggle(`§lNotification§r\nstatus§7: ${db.get(Mode.coordinatorNotificationToggle) ? '§aon' : '§coff'}`, db.get(Mode.coordinatorNotificationToggle) ?? true)
                    .show(pl).then(data => {
                    const config = data.formValues;
                    if (!config)
                        return;
                    db.set(Mode.coordinatorConfig, JSON.stringify({ positional: data.formValues[0], rotational: data.formValues[1] }));
                    db.set(Mode.coordinatorNotificationToggle, data.formValues[2]);
                    if (db.get(Mode.coordinatorNotificationToggle))
                        pl.sendMessage('Coordinate§7: §bconfig updated');
                });
            });
        }
        else if (db.get(Mode.coordinatorToggle)) {
            db.set(Mode.coordinatorToggle, false);
            if (db.get(Mode.coordinatorNotificationToggle))
                pl.sendMessage('Coordinate§7: §cdisabled');
        }
        else {
            db.set(Mode.coordinatorToggle, true);
            if (db.get(Mode.coordinatorNotificationToggle))
                pl.sendMessage('Coordinate§7: §aenabled');
        }
    }
});
server.system.runInterval(() => {
    server.world.getAllPlayers().forEach(pl => {
        const db = new Database(pl);
        const handItem = pl.getComponent(server.EntityInventoryComponent.componentId).container.getItem(pl.selectedSlot);
        if (!db.get(Mode.coordinatorToggle)) {
            if (handItem?.typeId == Items.coordinator.typeId)
                pl.onScreenDisplay.setActionBar('§cCoordinate disabled\n§7[Hold] to enable\n§7[Hold + Sneak] to config');
            return;
        }
        const pos = Object.values(pl.location).map(pos => pos.toFixed(db.get(Mode.coordinatorConfig).positional ?? 5));
        const rot = { x: pl.getRotation().x.toFixed(db.get(Mode.coordinatorConfig).rotational ?? 5), y: pl.getRotation().y.toFixed(db.get(Mode.coordinatorConfig).rotational ?? 5) };
        if (handItem?.typeId == Items.coordinator.typeId) {
            pl.onScreenDisplay.setActionBar(`Pos: ${pos[0]} / ${pos[1]} / ${pos[2]}\nRot(y/p): ${rot.y} / ${rot.x}\n§7[Hold + Sneak] to config`);
        }
        else {
            pl.onScreenDisplay.setActionBar(`Pos: ${pos[0]} / ${pos[1]} / ${pos[2]}\nRot(y/p): ${rot.y} / ${rot.x}`);
        }
    });
});
server.system.beforeEvents.watchdogTerminate.subscribe(watchDog => {
    watchDog.cancel = true;
});
