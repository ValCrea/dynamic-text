import type { Scope, Options, Animation, CompiledAnimation } from "types";

function quoteString(str: any | string) {
  return typeof str === "string" ? `"${str}"` : str;
}

export class FunText {
  static #splitScope: { [key in Scope]: string | null } = {
    all: null,
    sentence: "\n",
    word: " ",
    letter: "",
  };

  static #defaultCss =
    "position: relative;display:inline-block;margin:0;padding:0;white-space:pre;";

  /*#calculateOffset(currentCount, totalCount, currentLen, totalLen) {}
  #syncAnimations() {}*/

  static #warning(...args: any[]) {
    console.warn("FunTextWarning:", ...args);
  }

  static #error(...args: any[]): never {
    throw Error("FunTextError: " + [...args].join(" "));
  }

  static #elementBuilder(type: string, content: string) {
    const element = document.createElement(type);
    element.innerText = content;
    element.classList.add("funtext");
    return element;
  }

  static #nodeBuilder(split: string | null, content: string) {
    const isNewLine = split === "\n";
    const texts = split ? content.split(split) : [content];

    let nodes: HTMLElement[] = [];
    texts.forEach((text, index) => {
      if (isNewLine) {
        nodes.push(FunText.#elementBuilder("p", text));
      } else {
        nodes = [...nodes, ...FunText.#nodeBuilder("\n", text)];
      }

      if (split && index < texts.length - 1) {
        nodes.push(FunText.#elementBuilder(isNewLine ? "br" : "p", split));
      }
    });

    return nodes;
  }

  static typeCompress(variable: any, def: string, sfix: string = "") {
    return !variable
      ? def
      : typeof variable === "string"
      ? variable
      : `${variable}${sfix}`;
  }

  static #animationCompiler(animation: Animation): CompiledAnimation {
    const type = animation.type; // `${animation.type}`

    const steps: { [key: number]: string } = {};
    if (typeof animation.steps == "string") {
      steps[100] = animation.steps;
    } else if (animation.steps instanceof Array) {
      steps[0] = animation.steps[0];
      steps[100] = animation.steps[1];
    } else {
      for (const key of Object.keys(animation.steps)) {
        const numKey = parseFloat(key);
        steps[numKey] = animation.steps[numKey];
      }
    }

    const duration = FunText.typeCompress(animation.duration, "1s", "s");
    const delay = FunText.typeCompress(animation.delay, "0s", "s");
    const iteration = FunText.typeCompress(animation.iteration, "1");

    const direction = animation.direction ? animation.direction : "normal";
    const timing = animation.timing ? animation.timing : "ease";
    const fill = animation.fill ? animation.fill : "none";

    return {
      type,
      steps,
      duration,
      delay,
      iteration,
      direction,
      timing,
      fill,
    };
  }

  /*static #animationsCompiler(animations: Animation[]): CompiledAnimation[] {
    return [{ type: animations[0].type }, { type: animations[1].type }];
  }*/

  static #animationBuilder(animation: CompiledAnimation) {
    return `
      @keyframes ${animation.type} {
        from {
          color: red;
        }
        to {
          color: blue;
        }
      }
    `;
  }

  static #animationsBuilder(animation: CompiledAnimation) {
    return `
      @keyframes ${animation.type} {
        from {
          color: red;
        }
        to {
          color: blue;
        }
      }
    `;
  }

  #scope: Scope;
  #container: HTMLElement;
  #shadow!: ShadowRoot;
  #text: string;

  #nodes: HTMLElement[];
  #style!: HTMLStyleElement;

  #animations: Animation[];

  #buildNodes() {
    this.#nodes = FunText.#nodeBuilder(
      FunText.#splitScope[this.#scope],
      this.#text
    );
  }

  #buildStyle() {
    //const keyframes = FunText.#animationBuilder(this.#animations[0]);
    const keyframes = "";

    this.#style = document.createElement("style");
    this.#style.innerHTML = `
    ${keyframes}
    .funtext {
      ${FunText.#defaultCss}
      animation: ${"aa"} 5s infinite alternate;
    }
    `;
  }

  #buildShadow(): void | never {
    const shadow = this.#container.shadowRoot;
    if (!shadow) {
      try {
        this.#shadow = this.#container.attachShadow({ mode: "open" });
      } catch (err) {
        FunText.#error("Couldn't attach shadowRoot to container", err);
      }
    } else {
      if (shadow.querySelector("style")) {
        FunText.#error("Container already in use");
      } else {
        this.#shadow = shadow;
      }
    }
  }

  constructor(options: Options, animations: Animation[]) {
    this.#scope = options.scope;
    this.#container = options.container;
    this.#text = options.text || this.#container.innerText;

    this.#nodes = [];
    this.#animations = animations;

    this.#buildNodes();
    this.#buildStyle();
    this.#buildShadow();
  }

  mount() {
    this.#shadow.innerHTML = "";
    for (const node of this.#nodes) {
      this.#shadow.appendChild(node);
    }
    this.#shadow.appendChild(this.#style);

    return this;
  }

  unmount() {
    this.#shadow.innerHTML = "";
    this.#shadow.appendChild(document.createElement("slot"));

    return this;
  }

  pause() {}

  unpause() {}

  toggle() {}

  restart() {}
}
