import type {
  Sync,
  Steps,
  Scope,
  Options,
  Animation,
  CompiledAnimation,
  AnimationType,
} from "types";

function* numberKeys(object: { [key: number]: any }) {
  const keys = Object.keys(object);
  for (const k of keys) yield parseFloat(k);
}

export class FunText {
  static #splitScope: { [key in Scope]: string | null } = {
    all: null,
    sentence: "\n",
    word: " ",
    letter: "",
  };

  static #animateProperty: { [key in AnimationType]: string } = {
    horizontal: "left",
    vertical: "top",
    color: "color",
    background: "background-color",
    opacity: "opacity",
    scale: "scale",
    rotation: "rotate",
  };

  static #defaultCss = `
    position:relative;
    left:0;
    top:0;
    display:inline-block;
    margin:0;
    padding:0;
    white-space:pre;
    background-size: 100px;
  `;

  static #timeUnitConversion: { [key: string]: number } = {
    ms: 0.001,
  };

  static #animationSyncBegin: { [key in Sync["to"]]: number } = {
    start: 0,
    end: 100,
  };

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
    const isSPlitNew = split === "\n";
    const isSplitNull = split === null;
    const texts = isSplitNull ? [content] : content.split(split);

    let nodes: HTMLElement[] = [];
    texts.forEach((text, index) => {
      if (isSPlitNew || isSplitNull) {
        nodes.push(FunText.#elementBuilder("p", text));
      } else {
        nodes = [...nodes, ...FunText.#nodeBuilder("\n", text)];
      }

      if (split && index < texts.length - 1) {
        nodes.push(FunText.#elementBuilder(isSPlitNew ? "br" : "p", split));
      }
    });

    return nodes;
  }

  static #typeCompressor(variable: any, def: string, sfix: string = "") {
    return !variable
      ? def
      : typeof variable === "string"
      ? variable
      : `${variable}${sfix}`;
  }

  static #animationCompiler(animation: Animation): CompiledAnimation {
    const type = animation.type;

    const steps: Steps = {};
    if (typeof animation.steps === "string") {
      steps[0] = ["inherit", "0"];
      steps[100] = animation.steps;
    } else if (animation.steps instanceof Array) {
      steps[0] = animation.steps[0];
      steps[100] = animation.steps[1];
    } else {
      for (const key of numberKeys(animation.steps)) {
        steps[key] = animation.steps[key];
      }
    }

    const duration = FunText.#typeCompressor(animation.duration, "1s", "s");
    const delay = FunText.#typeCompressor(animation.delay, "0s", "s");
    const iteration = FunText.#typeCompressor(animation.iteration, "1");

    const direction = animation.direction || "normal";
    const timing = animation.timing || "ease-in-out";
    const fill = animation.fill || "none";
    const offset = animation.offset || 0;

    const compiled = {
      type,
      steps,
      duration,
      delay,
      iteration,
      direction,
      timing,
      fill,
      offset,
    };

    if (animation.sync) {
      const durationUnit = duration.replace(/[0-9]/g, "");
      let durationValue = parseFloat(duration.replace(/\W/g, ""));
      durationValue = isNaN(durationValue) ? 0 : durationValue;

      durationValue *=
        FunText.#timeUnitConversion[durationUnit.toLowerCase()] || 1;

      const ratio = durationValue / animation.sync.time;
      const move = FunText.#animationSyncBegin[animation.sync.to] * (1 - ratio);

      const syncedSteps: Steps = {};
      for (const key of numberKeys(compiled.steps)) {
        syncedSteps[key * ratio + move] = compiled.steps[key];
      }

      if (!syncedSteps[0]) {
        syncedSteps[0] = ["inherit", "0"];
      }
      if (!syncedSteps[100]) {
        syncedSteps[100] =
          syncedSteps[
            parseFloat(
              Object.keys(syncedSteps)[Object.keys(syncedSteps).length - 1]
            )
          ];
      }

      compiled.steps = syncedSteps;
      compiled.duration = `${animation.sync.time}s`;
    }

    return compiled;
  }

  static #animationBuilder(animations: CompiledAnimation[]) {
    const name = animations.map((an) => an.type).join(",");
    const duration = animations.map((an) => an.duration).join(",");
    const iteration = animations.map((an) => an.iteration).join(",");
    const direction = animations.map((an) => an.direction).join(",");
    const timing = animations.map((an) => an.timing).join(",");
    const fill = animations.map((an) => an.fill).join(",");

    const delay = animations
      .map((an) => `calc(${an.delay} + var(--offset-${an.type}))`)
      .join(",");

    return [
      `animation-name: ${name};`,
      `animation-duration: ${duration};`,
      `animation-delay: ${delay};`,
      `animation-iteration-count: ${iteration};`,
      `animation-direction: ${direction};`,
      `animation-timing-function: ${timing};`,
      `animation-fill-mode: ${fill};`,
    ].join("\n");
  }

  static #keyframeBuilder(animation: CompiledAnimation) {
    const property = FunText.#animateProperty[animation.type];
    let keyframes = "";
    for (const key of numberKeys(animation.steps)) {
      let properties = "";
      let step = animation.steps[key];
      if (typeof step === "string") {
        step = [step];
      }

      for (const s of step) {
        properties = `${properties}${property}:${s};`;
      }
      keyframes = `${keyframes} ${key}% { ${properties} }`;
    }

    return `
      @keyframes ${animation.type} {
        ${keyframes}
      }
    `;
  }

  #scope: Scope;
  #container: HTMLElement;
  #text: string;

  #animations!: CompiledAnimation[];
  #nodes!: HTMLElement[];
  #style!: HTMLStyleElement;
  #shadow!: ShadowRoot;

  #compileAnimations(animations: Animation[]) {
    this.#animations = [];
    for (const animation of animations) {
      this.#animations.push(FunText.#animationCompiler(animation));
    }
  }

  #buildNodes() {
    this.#nodes = FunText.#nodeBuilder(
      FunText.#splitScope[this.#scope],
      this.#text
    );
  }

  #buildStyle() {
    let keyframes = "";
    for (const animation of this.#animations) {
      keyframes = `${keyframes}${FunText.#keyframeBuilder(animation)}`;

      let curNode = null;
      const animationName = `--offset-${animation.type}`;

      let curLen = 0;
      const maxLen = this.#text.length;
      const maxInd = this.#nodes.length;
      for (let curInd = 0; curInd < maxInd; curInd++) {
        curNode = this.#nodes[curInd];
        curNode.style.setProperty(
          animationName,
          `${curInd * animation.offset}s`
        );
        curLen += curNode.innerText.length;
      }
    }

    this.#style = document.createElement("style");
    this.#style.innerHTML = `
    .funtext {
      ${FunText.#defaultCss}
      ${FunText.#animationBuilder(this.#animations)}
    }
    ${keyframes}
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
    this.#shadow.appendChild(document.createElement("slot"));
  }

  constructor(options: Options, animations: Animation[]) {
    this.#scope = options.scope;
    this.#container = options.container;
    this.#text = options.text || this.#container.innerText;
    this.#compileAnimations(animations);
  }

  build() {
    this.#buildNodes();
    this.#buildStyle();
    this.#buildShadow();

    return this;
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

  pause() {} // TODO

  unpause() {} // TODO

  toggle() {} // TODO

  restart() {} // TODO
}
