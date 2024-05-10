/* global ActorSheet mergeObject game renderTemplate Dialog FormDataExtended foundry ChatMessage TextEditor */

import D616 from "../rolls/d616.js";
import EffectUtils from "../effects/effects.js";
import { MVSettings } from "../utils/settings.js";

export default class SuperSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mvrpg", "sheet", "actor"],
      template: `systems/${game.system.id}/templates/actor/super-sheet.hbs`,
      width: 600,
      height: 670,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "powers",
        },
        {
          navSelector: ".powers-tabs",
          contentSelector: ".powers-body",
          initial: "tags",
        },
      ],
      scrollY: [".editor-content"],
    });
  }

  /**
   * @override
   */
  async getData() {
    const foundryData = super.getData();
    const mvrpgData = {};
    const { actor } = this;

    mvrpgData.displaySpeed =
      actor.getFlag(game.system.id, "displaySpeed") || "run";

    // Prepare only data relevant to damage mutipliers for simplicity in the template.
    const damageData = Object.entries(actor.system.abilities)
      .filter(([name]) => name !== "resilience" && name !== "vigilance")
      .map(([name, abilityData]) => ({
        name,
        damageModifier: abilityData.damageModifier,
        damageMultiplier: abilityData.damageMultiplier,
      }));
    mvrpgData.damageData = damageData;

    // Prepare rollable items for combat tab.
    const rollableItems = actor.itemTypes.power.filter(
      (item) => item.system.roll.hasRoll,
    );
    mvrpgData.rollableItems = rollableItems;

    mvrpgData.enrichedNotes = await TextEditor.enrichHTML(
      actor.system.identity.notes,
      { async: true },
    );

    const allEffects = Array.from(this.actor.allApplicableEffects());
    mvrpgData.allEffects = allEffects;

    return { ...foundryData, ...mvrpgData };
  }

  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;
    html.find(".rollable").click((event) => this.onRoll(event));

    html.find(".open-config").click(() => this.showConfig());

    html.find(".doc-action").click((event) => this.onItemAction(event));

    html
      .find(".effect-action")
      .click((event) => EffectUtils.onEffectAction(this.actor, event));
  }

  /**
   * Handles different actions for items.
   *
   * @param {event} event - the event triggering the action
   * @return {void}
   */
  onItemAction(event) {
    const { action, docId, docType } = event.currentTarget.dataset;
    const doc = this.actor.items.get(docId);

    switch (action) {
      case "create":
        this.actor.createEmbeddedDocuments("Item", [
          {
            name: game.i18n.format(game.i18n.translations.DOCUMENT.New, {
              type: game.i18n.localize(`TYPES.Item.${docType}`),
            }), // Foundry's localization ("New Active Effect")
            type: docType,
          },
        ]);
        break;
      case "edit":
        doc.sheet.render(true);
        break;
      case "delete": {
        const skipDialog = MVSettings.skipDeleteDialog();
        this.deleteOwnedItem(doc, skipDialog);
        break;
      }
      case "toChat":
        this.sendItemToChat(doc);
        break;
      default:
        break;
    }
  }

  async deleteOwnedItem(doc, skipDialog) {
    if (!skipDialog) {
      const confirmDelete = await Dialog.confirm({
        title: game.i18n.localize("MVRPG.dialog.deleteOwnedItem.title"),
        content: game.i18n.format("MVRPG.dialog.deleteOwnedItem.text", {
          itemType: game.i18n.localize(`TYPES.Item.${doc.type}`),
          itemName: doc.name,
        }),
      });
      if (!confirmDelete) return;
    }
    this.actor.deleteEmbeddedDocuments("Item", [doc.id]);
  }

  /**
   * Handle the roll event and execute associated actions.
   *
   * @param {Event} event - The roll event
   * @return {Promise} A promise that resolves when the roll event is handled
   */
  async onRoll(event) {
    const { rollType, ability } = event.currentTarget.dataset;
    const actorData = this.actor.system;

    let modifier;
    switch (rollType) {
      case "initiative":
        modifier = actorData.initiative.value;
        break;
      case "nonCombat":
        modifier = actorData.abilities[ability].nonCombatScore;
        break;
      default:
        modifier = actorData.abilities[ability].value;
        break;
    }
    const { edges, troubles } = actorData.abilities[ability];

    return D616.createD616Roll({
      rollType,
      ability,
      modifier,
      edges,
      troubles,
      actor: this.actor,
    });
  }

  async showConfig() {
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/dialogs/init-speed-dialog.hbs`,
      { actor: this.actor },
    );
    const dialog = new Dialog(
      {
        content,
        title: game.i18n.localize("MVRPG.dialog.initSpeed.title"),
        default: "confirm",
        buttons: {
          confirm: {
            icon: `<i class="fa-solid fa-spider"></i>`,
            label: game.i18n.localize("MVRPG.dialog.buttons.confirm"),
            callback: (html) => {
              const fd = new FormDataExtended(html.find("form")[0]);
              const formData = foundry.utils.expandObject(fd.object);
              this.actor.update(formData);
            },
          },
        },
      },
      {
        id: "init-speed-dialog",
        classes: ["mvrpg", "mvrpg-dialog", "actor"],
        width: 300,
      },
    );
    dialog.render(true);
  }

  sendItemToChat(item) {
    const { description } = item.system;
    const title = item.name;
    let content = "";
    content += `<h1>${title}</h1>`;
    content += `<div>${description}</div>`;
    const chatData = {
      content,
      flavor: game.i18n.localize(`TYPES.Item.${item.type}`),
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    };
    ChatMessage.create(chatData);
  }
}
