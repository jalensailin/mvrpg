import MVEffect from "./effects.js";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * @param {*} html
 * @override
 */
export default class MVEffectConfig extends ActiveEffectConfig {
  /**
   * Open AE config on the "changes" tab.
   * @inheritdoc
   */
  static TABS = (() => {
    const tabs = super.TABS;
    tabs.sheet.initial = "changes";
    return tabs;
  })();

  /** @inheritdoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

    await this._insertDropDowns();

    // Add event listeners.
    const html = this.element;
    html.querySelectorAll(".toggle-text-input").forEach((button) => {
      button.addEventListener("click", (event) => {
        this.toggleTextInput(event);
      });
    });

    html.querySelectorAll("select.effect-drop-down").forEach((select) => {
      select.addEventListener("change", (event) => {
        MVEffectConfig.updateDropDownToolTip(select);
      });
    });
  }

  /**
   * Insert a drop-down for the effect's change key, replacing the default text-input.
   * We only replace it if the value is in the list of options, otherwise we just insert
   * the appropriate button and leave it as a text-input.
   *
   * @returns {Promise<void>}
   */
  async _insertDropDowns() {
    const html = this.element;
    const effectKeyInputs = html.querySelectorAll(
      "ol[data-changes] > li > .key > input[type='text']",
    );

    const effectOptions = MVEffect.getEffectOptions();
    for (const [index, input] of Array.from(effectKeyInputs).entries()) {
      const { renderTemplate } = foundry.applications.handlebars;
      // eslint-disable-next-line no-await-in-loop
      const selectTemplate = await renderTemplate(
        `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
        { changes: this.document.changes, index, effectOptions },
      );

      const selectOptions = MVEffect.getEffectKeys();
      const valueInOptions = selectOptions.includes(input.value);

      let buttonTooltip = game.i18n.localize(
        "MVRPG.sheets.effects.tooltips.toggleTextInput",
      );
      let iconClass = "fa-keyboard";
      if (!valueInOptions && input.value) {
        // If the value is not in the list of options AND not empty, then it's a custom key.
        buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        iconClass = "fa-list";
      }
      const buttonTemplate = `<a class="toggle-text-input" data-index="${index}" data-tooltip="${buttonTooltip}"><i class="fa-solid ${iconClass}"></i></a>`;

      if (valueInOptions || !input.value) {
        // If the value is in the list of options OR empty, then it's a default key (or empty).
        $(input).replaceWith(`${buttonTemplate}${selectTemplate}`);
      } else {
        $(input).before(`${buttonTemplate} `);
        const iconWidth = html.querySelector(".toggle-text-input").outerWidth();
        $(input).css("width", `calc(100% - ${(iconWidth || 16) + 8}px)`);
      }
    }
  }

  /**
   * A function to toggle between <input> and <select> elements in the Active Effect config.
   * In general, users will want the drop-down option, because it is more intuitive, but some
   * may still wish to input custom values, in which case they can switch to the text input.
   *
   * @param {Event} event - The event triggering the function.
   * @return {void}
   */
  async toggleTextInput(event) {
    const index = $(event.currentTarget).data("index"); // Get the index from the button.
    const keyInput = $(event.currentTarget).next(); // Get the input, either an actual <input> element, or a <select> element.
    const elementType = keyInput.prop("nodeName").toLowerCase(); // Get the element type ("input" or "select").
    const name = keyInput.attr("name");
    const value = keyInput.val();

    const buttonIcon = $(event.currentTarget).find("i"); // Find the button icon.
    const buttonWidth = buttonIcon.outerWidth();

    let finalTemplate;
    switch (elementType) {
      // Replace the <input> element with a <select> element.
      case "input": {
        const selectOptions = MVEffect.getEffectKeys();
        // Warn the user before swapping back to <select> if the value is not in the list of options (since it will get lost).
        if (!selectOptions.includes(value)) {
          const confirmInput = await Dialog.confirm({
            title: game.i18n.localize("MVRPG.dialog.confirmTextInput.title"),
            content: game.i18n.localize("MVRPG.dialog.confirmTextInput.text"),
          });
          if (!confirmInput) return;
        }

        const effectOptions = MVEffect.getEffectOptions();

        const { renderTemplate } = foundry.applications.handlebars;
        const selectTemplate = await renderTemplate(
          `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
          { changes: this.document.changes, index, effectOptions },
        );

        const jquerySelectObject = $(selectTemplate);
        jquerySelectObject.val(value || selectOptions[0]);
        finalTemplate = jquerySelectObject;

        buttonIcon.removeClass("fa-list"); // Remove list icon.
        buttonIcon.addClass("fa-keyboard"); // Toggle to keyboard icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleTextInput",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      // Replace the <select> element with an <input> element.
      case "select": {
        // Typically it's best to keep all styling in a css file, but in this case, the width relies on a value derived above so we need to add it here.
        finalTemplate = `<input type="text" name="${name}" value="${value || ""}" style="width: calc(100% - ${buttonWidth + 8}px);"/>`;

        buttonIcon.removeClass("fa-keyboard"); // Remove keyboard icon.
        buttonIcon.addClass("fa-list"); // Toggle to list icon.
        const buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        buttonIcon.attr("data-tooltip", buttonTooltip);
        break;
      }
      default:
        break;
    }

    keyInput.replaceWith(finalTemplate);
  }

  /**
   * Update the tooltip for the drop-down to display the selected key.
   *
   * @param {*} selectElement
   */
  static updateDropDownToolTip(selectElement) {
    const newVal = $(selectElement).val();
    $(selectElement).attr("data-tooltip", newVal);
  }
}
