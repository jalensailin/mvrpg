import MVEffect from "./effects.js";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * @param {*} html
 * @override
 */
export default class MVEffectConfig extends ActiveEffectConfig {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    actions: {
      toggleInput: MVEffectConfig.toggleInput,
    },
  };

  /**
   * Open AE config on the "changes" tab.
   * @inheritdoc
   */
  static TABS = {
    sheet: { ...super.TABS.sheet, initial: "changes" },
  };

  /** @inheritdoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

    await this._insertDropDowns();

    // Add event listeners.
    this.element
      .querySelectorAll("select.effect-drop-down")
      .forEach((select) => {
        select.addEventListener("change", (event) => {
          MVEffectConfig.updateDropDownToolTip(event.target);
        });
      });
  }

  /**
   * Insert a drop-down for the effect's change key, replacing the default text-input.
   * @returns {Promise<void>}
   */
  async _insertDropDowns() {
    const html = this.element;
    const effectKeyInputs = html.querySelectorAll(
      "ol[data-changes] > li > .key > input[type='text']",
    );

    const effectOptions = MVEffect.getEffectOptions();
    const selectOptions = MVEffect.getEffectKeys();

    for (const [index, input] of Array.from(effectKeyInputs).entries()) {
      const { renderTemplate } = foundry.applications.handlebars;
      // eslint-disable-next-line no-await-in-loop
      const selectTemplate = await renderTemplate(
        `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
        { changes: this.document.changes, index, effectOptions },
      );

      const valueInOptions = selectOptions.includes(input.value);

      let buttonTooltip = game.i18n.localize(
        "MVRPG.sheets.effects.tooltips.toggleTextInput",
      );
      let iconClass = "fa-keyboard";
      if (!valueInOptions && input.value) {
        buttonTooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        iconClass = "fa-list";
      }

      const buttonTemplate = document.createElement("a");
      buttonTemplate.dataset.index = index;
      buttonTemplate.dataset.action = "toggleInput";
      buttonTemplate.dataset.tooltip = buttonTooltip;
      buttonTemplate.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;

      if (valueInOptions || !input.value) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = selectTemplate;
        const selectElement = wrapper.firstElementChild;

        input.parentNode.replaceChild(buttonTemplate, input);
        buttonTemplate.insertAdjacentElement("afterend", selectElement);
      } else {
        input.parentNode.insertBefore(buttonTemplate, input);

        const icon = buttonTemplate.querySelector("i");
        const iconWidth = icon?.offsetWidth || 16;
        input.style.width = `calc(100% - ${iconWidth + 8}px)`;
      }
    }
  }

  /**
   * Toggle between <input> and <select> in the Active Effect config.
   * @param {Event} event
   * @return {Promise<void>}
   */
  static async toggleInput(event, target) {
    const button = target;
    const { index } = button.dataset;
    const keyInput = button.nextElementSibling;
    if (!keyInput) return;

    const elementType = keyInput.nodeName.toLowerCase();
    const name = keyInput.getAttribute("name");
    const { value } = keyInput;
    const buttonIcon = button.querySelector("i");
    const buttonWidth = buttonIcon?.offsetWidth || 16;

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
        const selectHTML = await renderTemplate(
          `systems/${game.system.id}/templates/effects/effects-drop-down.hbs`,
          { changes: this.document.changes, index, effectOptions },
        );

        const wrapper = document.createElement("div");
        wrapper.innerHTML = selectHTML;
        finalTemplate = wrapper.firstElementChild;

        finalTemplate.value = value || selectOptions[0];

        buttonIcon.classList.remove("fa-list");
        buttonIcon.classList.add("fa-keyboard");
        button.dataset.tooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleTextInput",
        );
        break;
      }
      case "select": {
        finalTemplate = document.createElement("input");
        finalTemplate.type = "text";
        finalTemplate.name = name;
        finalTemplate.value = value || "";
        finalTemplate.style.width = `calc(100% - ${buttonWidth + 8}px)`;

        buttonIcon.classList.remove("fa-keyboard");
        buttonIcon.classList.add("fa-list");
        button.dataset.tooltip = game.i18n.localize(
          "MVRPG.sheets.effects.tooltips.toggleDropDown",
        );
        break;
      }
      default:
        break;
    }

    keyInput.replaceWith(finalTemplate);
  }

  /**
   * Update the tooltip for the drop-down to display the selected key.
   * @param {HTMLSelectElement} selectElement
   * @returns {void}
   */
  static updateDropDownToolTip(selectElement) {
    selectElement.setAttribute("data-tooltip", selectElement.value);
  }
}
