import * as server from '@minecraft/server'
import * as Form from '@minecraft/server-ui'

server.world.beforeEvents.itemUse.subscribe(data => {
    const item = data.itemStack
    if (item.typeId !== 'minecraft:nether_star') return
    const form = new Form.ActionFormData()
        .title('Warp')
        .button('§l§2OneJump§a Selector')
})