/* global Hooks Actors ActorSheet */
import SuperSheet from "./actor/super-sheet.js";

Hooks.once("init", async () => {
  console.log("I am GROOT");

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });
});
