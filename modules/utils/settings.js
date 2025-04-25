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

  game.settings.register("mvrpg", "mvDieFlavor", {
    name: "MVRPG.settings.mvDieFlavor.title",
    hint: "MVRPG.settings.mvDieFlavor.hint",
    scope: "client",
    config: true,
    default: "bloodmoon",
    type: String,
  });

  game.settings.register("mvrpg", "rerollFlavor", {
    name: "MVRPG.settings.rerollFlavor.title",
    hint: "MVRPG.settings.rerollFlavor.hint",
    scope: "client",
    config: true,
    default: "cold",
    type: String,
  });

  game.settings.register("mvrpg", "rerollMvDieFlavor", {
    name: "MVRPG.settings.rerollMvDieFlavor.title",
    hint: "MVRPG.settings.rerollMvDieFlavor.hint",
    scope: "client",
    config: true,
    default: "force",
    type: String,
  });
}

export class MVSettings {
  static skipDeleteDialog() {
    const ctrlKey = game.keyboard.isModifierActive("Control");
    return game.settings.get("mvrpg", "skipDeleteDialogs") ? !ctrlKey : ctrlKey;
  }

  static skipRollDialog() {
    const ctrlKey = game.keyboard.isModifierActive("Control");
    return game.settings.get("mvrpg", "skipRollDialogs") ? !ctrlKey : ctrlKey;
  }
}
