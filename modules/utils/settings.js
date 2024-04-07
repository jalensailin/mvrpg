/* global game keyboard */

export default function registerSettings() {
  game.settings.register("mvrpg", "autoRerollTroubles", {
    name: "MVRPG.settings.autoRerollTroubles.title",
    hint: "MVRPG.settings.autoRerollTroubles.hint",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register("mvrpg", "skipRollDialogs", {
    name: "MVRPG.settings.skipRollDialogs.title",
    hint: "MVRPG.settings.skipRollDialogs.hint",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register("mvrpg", "skipDeleteDialogs", {
    name: "MVRPG.settings.skipDeleteDialogs.title",
    hint: "MVRPG.settings.skipDeleteDialogs.hint",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });
}

export class MVSettings {
  static skipDeleteDialog() {
    const ctrlKey = keyboard.isModifierActive("Control");
    return game.settings.get("mvrpg", "skipDeleteDialogs") ? !ctrlKey : ctrlKey;
  }

  static skipRollDialog() {
    const ctrlKey = keyboard.isModifierActive("Control");
    return game.settings.get("mvrpg", "skipRollDialogs") ? !ctrlKey : ctrlKey;
  }
}
