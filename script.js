"use strict";

function quoteString(str) {
  return typeof str === "string" || str instanceof String ? `"${str}"` : str;
}

class FunText {
  static #scopes = ["all", "sentence", "word", "letter"];
  static #splitScope = {
    all: null,
    sentence: "\n",
    word: " ",
    letter: "",
  };

  static #styleDefault =
    "position: relative;display:inline-block;margin:0;padding:0;white-space:pre;";

  static #styleVariables =
    ":host{--offset-horizontal:0;--offset-vertical:0;--offset-color:0;--offset-background:0;--offset-opacity:0;--offset-scale:0;--offset-rotation:0;}";

  /*#calculateOffset(currentCount, totalCount, currentLen, totalLen) {}
  #syncAnimations() {}*/

  static #warning() {
    console.warn("FunTextWarning:", ...arguments);
  }

  static #error() {
    throw Error("FunTextError: " + [...arguments].join(" "));
  }

  static #validateScope(scope) {
    if (FunText.#scopes.includes(scope)) {
      return scope;
    } else {
      FunText.#warning(
        `InvalidParameter: ${quoteString(scope)}, defaulting to "all"`
      );
      return "all";
    }
  }

  static #validateContainer(container) {
    if (container instanceof HTMLElement) {
      return container;
    } else {
      FunText.#error(`InvalidParameter: ${container}, must be HTMLElement`);
      return null;
    }
  }

  static #validateAnimation(animation) {}

  static #createElement(type, content) {
    const element = document.createElement(type);
    element.innerText = content;
    element.classList.add("funtext");
    return element;
  }

  static #createShadow(container) {
    try {
      container.attachShadow({ mode: "open" });
    } catch {
      FunText.#error("InvalidParameter:", container, "already has shadowRoot");
    }
  }

  static #createNodes(split, content) {
    const isNewLine = split === "\n";
    const texts = content.split(split);

    let nodes = [];
    texts.forEach((text, index) => {
      if (isNewLine) {
        nodes.push(FunText.#createElement("p", text));
      } else {
        nodes = [...nodes, ...FunText.#createNodes("\n", text)];
      }

      if (split && index < texts.length - 1) {
        nodes.push(FunText.#createElement(isNewLine ? "br" : "p", split));
      }
    });

    return nodes;
  }

  static #createStyle() {
    const style = document.createElement("style");
    style.innerHTML = `
    ${FunText.#styleVariables}
    .funtext {
      ${FunText.#styleDefault}
    }
    `;
    return style;
  }

  #scope;
  #container;

  #text;
  #nodes;
  #style;

  #animations;

  constructor(options, animations) {
    if (!options) {
      FunText.#error("InvalidParameter: Missing options");
    }
    if (!animations) {
      FunText.#error("InvalidParameter: Missing animations");
    }

    this.#scope = FunText.#validateScope(options.scope);
    this.#container = FunText.#validateContainer(options.container);
    this.#text = options.text || this.#container.innerText;

    for (const ani of animations) {
      console.log(ani.type);
    }
  }

  build() {
    FunText.#createShadow(this.#container);
    this.#container.shadowRoot.appendChild(document.createElement("slot"));

    this.#style = FunText.#createStyle();
    this.#nodes = FunText.#createNodes(
      FunText.#splitScope[this.#scope],
      this.#text
    );

    return this;
  }

  // rebuild

  mount() {
    this.#container.shadowRoot.innerHTML = "";
    for (const node of this.#nodes) {
      this.#container.shadowRoot.appendChild(node);
    }
    this.#container.shadowRoot.appendChild(this.#style);

    return this;
  }

  unmount() {
    this.#container.shadowRoot.innerHTML = "";
    this.#container.shadowRoot.appendChild(document.createElement("slot"));

    return this;
  }

  pause() {}

  unpause() {}

  toggle() {}

  restart() {}
}
