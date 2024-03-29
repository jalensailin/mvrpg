/* global Hooks Actors ActorSheet Items ItemSheet CONFIG */
import SuperSheet from "./actor/super-sheet.js";
import MVChat from "./chat/chat.js";
import SuperDataModel from "./datamodels/actor/super-datamodel.js";
import * as MVRolls from "./rolls/d616.js";
import registerSettings from "./utils/settings.js";
import loadTemplates, { registerHelpers } from "./utils/handlebars.js";
import TagDataModel from "./datamodels/item/tag-schema.js";
import MVItemSheet from "./item/item-sheet.js";

// CONFIG.debug.hooks = true;

Hooks.once("init", async () => {
  console.log("I am GROOT");
  Object.values(MVRolls).forEach((cls) => CONFIG.Dice.rolls.push(cls));

  // Register Actor sheet.
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mvrpg", SuperSheet, {
    makeDefault: true,
  });

  // Register Item sheet.
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("mvrpg", MVItemSheet, {
    makeDefault: true,
  });

  // Register Actor data models.
  CONFIG.Actor.dataModels.super = SuperDataModel;

  // Register Item data models.
  CONFIG.Item.dataModels.tag = TagDataModel;

  // Turn off legacy tranferral for active effects. Necessary for v11.
  CONFIG.ActiveEffect.legacyTransferral = false;

  loadTemplates();
  registerHelpers();
  registerSettings();
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
