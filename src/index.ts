import type {
  Sync,
  Steps,
  Scope,
  Options,
  Animation,
  CompiledAnimation,
  AnimationType,
} from "types";

/*
  UTILITIES
*/

// Generates object keys and numbers instead of strings
function* numberKeys(object: { [key: number]: any }) {
  const keys = Object.keys(object);
  for (const k of keys) yield parseFloat(k);
}

/*
  |‾‾‾  |   |  |\  |    ‾‾|‾‾  |‾‾‾  \  /  ‾‾|‾‾
  |‾‾   |   |  | \ |      |    |—     \\     |
  |     |___|  |  \|      |    |___  /  \    |
*/
export default class FunText {
  /*static #animationProperties = ["name", "duration", "delay", "iteration"]
  static #animationFunctionNames = ["name", "duration", "delay", "iteration-count", "direction", "timing-function", "fill-mode"];*/

  /*#calculateOffset(currentCount, totalCount, currentLen, totalLen) {}
  #syncAnimations() {}*/

  /*
    WARNINGS AND ERRORS
  */

  static #warning(...args: any[]) {
    console.warn("FunTextWarning:", ...args);
  }

  static #error(...args: any[]): never {
    throw Error("FunTextError: " + [...args].join(" "));
  }

  /*
    INPUT ANIMATION
  */

  // Time unit to second conversion
  static #animationTimeConvert: { [key: string]: number } = {
    s: 1,
    ms: 0.001,
  };

  // Sync keyword to percentage
  static #animationSyncTo: { [key in Sync["to"]]: number } = {
    start: 0,
    end: 100,
  };

  static #typeCompressor(variable: any, def: string, sfix: string = "") {
    return !variable
      ? def
      : typeof variable === "string"
      ? variable
      : `${variable}${sfix}`;
  }

  // Converts input animation into a more program firendly format
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

    // TODO: clean code
    if (animation.sync) {
      const durationUnit = duration.replace(/[0-9]/g, "");
      let durationValue = parseFloat(duration.replace(/\W/g, ""));
      durationValue = isNaN(durationValue) ? 0 : durationValue;

      durationValue *=
        FunText.#animationTimeConvert[durationUnit.toLowerCase()] || 1;

      const ratio = durationValue / animation.sync.time;
      const move = FunText.#animationSyncTo[animation.sync.to] * (1 - ratio);

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

  // Converts and sets all input animations
  #compileAnimations(animations: Animation[]) {
    this.#animations = [];
    for (const animation of animations) {
      this.#animations.push(FunText.#animationCompiler(animation));
    }
  }

  /*
    DOM NODES
  */

  // Ways to split text depending on the scope
  static #scopeSplit: { [key in Scope]: string | null } = {
    all: null,
    sentence: "\n",
    word: " ",
    letter: "",
  };

  // Creates a dom element with default styling
  static #elementBuilder(type: string, content: string) {
    const element = document.createElement(type);
    element.innerText = content;
    element.classList.add("funtext");
    return element;
  }

  // Splits input text into nodes dependin on the scope
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

  // Builds and sets nodes
  #buildNodes() {
    this.#nodes = FunText.#nodeBuilder(
      FunText.#scopeSplit[this.#scope],
      this.#text
    );
  }

  /*
    STYLE
  */

  // Properties that animation types target
  static #animationTarget: { [key in AnimationType]: string } = {
    horizontal: "left",
    vertical: "top",
    color: "color",
    background: "background-color",
    opacity: "opacity",
    scale: "scale",
    rotation: "rotate",
  };

  // Default css for new nodes
  static #styleDefault = `
    position:relative;
    left:0;
    top:0;
    display:inline-block;
    margin:0;
    padding:0;
    white-space:pre;
    background-size: 100px;
  `;

  // Builds keyframes for given animation
  static #keyframeBuilder(animation: CompiledAnimation) {
    const property = FunText.#animationTarget[animation.type];
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

  // Merges different animations and applies variables
  static #animationBuilder(animations: CompiledAnimation[]) {
    // TODO optimize this loop hell
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

  // Creates and fills style for default layout and specified animations
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
      ${FunText.#styleDefault}
      ${FunText.#animationBuilder(this.#animations)}
    }
    ${keyframes}
    `;
  }

  /*
    SHADOW
  */

  // Turn the given container into a shadow host
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

  /*
    INIT  
  */

  #scope: Scope;
  #container: HTMLElement;
  #text: string;

  #animations!: CompiledAnimation[];
  #nodes!: HTMLElement[];
  #style!: HTMLStyleElement;
  #shadow!: ShadowRoot;

  constructor(options: Options, animations: Animation[]) {
    this.#scope = options.scope;
    this.#container = options.container;
    this.#text = options.text || this.#container.innerText;
    this.#compileAnimations(animations);
  }

  /*
    BUILD  
  */

  build() {
    this.#buildNodes();
    this.#buildStyle();
    this.#buildShadow();

    return this;
  }

  /*
    MOUNT  
  */

  mount() {
    this.#shadow.innerHTML = "";
    for (const node of this.#nodes) {
      this.#shadow.appendChild(node);
    }
    this.#shadow.appendChild(this.#style);

    return this;
  }

  /*
    UNMOUNT  
  */

  unmount() {
    this.#shadow.innerHTML = "";
    this.#shadow.appendChild(document.createElement("slot"));

    return this;
  }

  /*
    MANIPULATE ANIMATION WITH JS  
  */

  pause() {} // TODO

  unpause() {} // TODO

  toggle() {} // TODO

  restart() {} // TODO
}
