/* global ActorSheet mergeObject game renderTemplate Dialog FormDataExtended foundry */

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
      ],
    });
  }

  /**
   * @override
   */
  async getData() {
    const foundryData = super.getData();
    const mvrpgData = {};

    // Group speeds with the same value.
    const speeds = this.actor.system.speed;
    const groupedSpeeds = {};
    for (const [speedType, speedVal] of Object.entries(speeds)) {
      if (Array.isArray(groupedSpeeds[speedVal])) {
        groupedSpeeds[speedVal].push(speedType);
      } else {
        groupedSpeeds[speedVal] = [speedType];
      }
    }
    mvrpgData.speeds = groupedSpeeds;
    mvrpgData.displaySpeed =
      this.actor.getFlag(game.system.id, "displaySpeed") || "run";

    return { ...foundryData, ...mvrpgData };
  }

  /**
   * @param {*} html
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;
    html.find(".open-config").click(() => this.showConfig());
  }

  async showConfig() {
    const content = await renderTemplate(
      `systems/${game.system.id}/templates/actor/dialogs/init-speed-dialog.hbs`,
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
}
