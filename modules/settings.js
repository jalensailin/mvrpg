/* global game */

export default function registerSettings() {
  game.settings.register("mvrpg", "autoRerollTroubles", {
    name: "MVRPG.settings.autoRerollTroubles.title",
    hint: "MVRPG.settings.autoRerollTroubles.hint",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
  });
}
