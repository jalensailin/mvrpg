/* global Hooks Actors ActorSheet CONFIG */
import SuperSheet from "./actor/super-sheet.js";
import MVChat from "./chat/chat.js";
import * as MVRolls from "./rolls/d616.js";

CONFIG.debug.hooks = true;

Hooks.once("init", async () => {
  console.log("I am GROOT");
  Object.values(MVRolls).forEach((cls) => CONFIG.Dice.rolls.push(cls));

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });
});

/**
 * Activate listeners for the chat.
 *
 * @param {Application} app - The Application instance being rendered
 * @param {jQuery} html - The inner HTML of the document that will be displayed and may be modified
 * @param {Object} data - The object of data used when rendering the application
 * @return {void}
 */
Hooks.on("renderChatLog", (app, html, data) => {
  MVChat.activateChatListeners(html);
});
