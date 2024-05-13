/* global Macro game fromUuidSync ui */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export default function createItemMacro(data, slot) {
  const item = fromUuidSync(data.uuid);
  if (!item)
    return ui.notifications.error(
      game.i18n.format("MVRPG.notifications.macro.itemNotFound"),
      { itemName: item.name },
    );

  if (item.type !== "power") return true;

  // Create the macro command
  const command = `game.mvrpg.D616.createItemRoll(actor, "${item.id}");`;

  const macro = game.macros.find(
    (m) => m.name === item.name && m.command === command,
  );
  if (!macro) {
    Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command,
      // flags: { "mvrpg.itemMacro": true }, // Do I need this?
    }).then((m) => {
      game.user.assignHotbarMacro(m, slot);
    });
  } else {
    game.user.assignHotbarMacro(macro, slot);
  }

  return false;
}
