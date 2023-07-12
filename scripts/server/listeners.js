import { system, world } from "@minecraft/server";
const oldTag = new Map();
export function tagUpdate(callback) {
    system.runInterval(() => {
        world.getAllPlayers().forEach(pl => {
            const tag = pl.getTags();
            const old = oldTag.get(pl);
            if (old) {
                const added = tag.filter(t => !old.includes(t));
                const removed = old.filter(t => !tag.includes(t));
                if (added.length > 0) {
                    added.forEach(t => callback(pl, t, 'add'));
                }
                if (removed.length > 0) {
                    removed.forEach(t => callback(pl, t, 'remove'));
                }
            }
            oldTag.set(pl, tag);
        });
    });
}
