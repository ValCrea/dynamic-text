"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunText = void 0;
class FunText {
    static #splitScope = {
        all: null,
        sentence: "\n",
        word: " ",
        letter: "",
    };
    static #animateProperty = {
        horizontal: "left",
        vertical: "top",
        color: "color",
        background: "background-color",
        opacity: "opacity",
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
    static #defaultVariables = `
    :host {
      --offset-horizontal: 0;
      --offset-vertical: 0;
      --offset-color: 0;
      --offset-background: 0;
      --offset-opacity: 0;
    }
  `;
    /*#calculateOffset(currentCount, totalCount, currentLen, totalLen) {}
    #syncAnimations() {}*/
    static #warning(...args) {
        console.warn("FunTextWarning:", ...args);
    }
    static #error(...args) {
        throw Error("FunTextError: " + [...args].join(" "));
    }
    static #elementBuilder(type, content) {
        const element = document.createElement(type);
        element.innerText = content;
        element.classList.add("funtext");
        return element;
    }
    static #nodeBuilder(split, content) {
        const isSPlitNew = split === "\n";
        const isSplitNull = split === null;
        const texts = isSplitNull ? [content] : content.split(split);
        let nodes = [];
        texts.forEach((text, index) => {
            if (isSPlitNew || isSplitNull) {
                nodes.push(FunText.#elementBuilder("p", text));
            }
            else {
                nodes = [...nodes, ...FunText.#nodeBuilder("\n", text)];
            }
            if (split && index < texts.length - 1) {
                nodes.push(FunText.#elementBuilder(isSPlitNew ? "br" : "p", split));
            }
        });
        return nodes;
    }
    static #typeCompressor(variable, def, sfix = "") {
        return !variable
            ? def
            : typeof variable === "string"
                ? variable
                : `${variable}${sfix}`;
    }
    static #animationCompiler(animation) {
        const type = animation.type;
        const steps = {};
        if (typeof animation.steps === "string") {
            steps[100] = animation.steps;
        }
        else if (animation.steps instanceof Array) {
            steps[0] = animation.steps[0];
            steps[100] = animation.steps[1];
        }
        else {
            for (const key of Object.keys(animation.steps)) {
                const numKey = parseFloat(key);
                steps[numKey] = animation.steps[numKey];
            }
        }
        const duration = FunText.#typeCompressor(animation.duration, "1s", "s");
        const delay = FunText.#typeCompressor(animation.delay, "0s", "s");
        const iteration = FunText.#typeCompressor(animation.iteration, "1");
        const direction = animation.direction || "normal";
        const timing = animation.timing || "ease-in-out";
        const fill = animation.fill || "none";
        const offset = animation.offset || 0;
        return {
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
    }
    static #animationBuilder(animations) {
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
    static #keyframeBuilder(animation) {
        const property = FunText.#animateProperty[animation.type];
        let keyframes = "";
        for (const key of Object.keys(animation.steps)) {
            keyframes = `${keyframes} ${key}% { ${property}:${animation.steps[key]}; }`;
        }
        return `
      @keyframes ${animation.type} {
        ${keyframes}
      }
    `;
    }
    #scope;
    #container;
    #text;
    #animations;
    #nodes;
    #style;
    #shadow;
    #compileAnimations(animations) {
        this.#animations = [];
        for (const animation of animations) {
            this.#animations.push(FunText.#animationCompiler(animation));
        }
    }
    #buildNodes() {
        this.#nodes = FunText.#nodeBuilder(FunText.#splitScope[this.#scope], this.#text);
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
                curNode.style.setProperty(animationName, `${curInd * animation.offset}s`);
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
    #buildShadow() {
        const shadow = this.#container.shadowRoot;
        if (!shadow) {
            try {
                this.#shadow = this.#container.attachShadow({ mode: "open" });
            }
            catch (err) {
                FunText.#error("Couldn't attach shadowRoot to container", err);
            }
        }
        else {
            if (shadow.querySelector("style")) {
                FunText.#error("Container already in use");
            }
            else {
                this.#shadow = shadow;
            }
        }
        this.#shadow.appendChild(document.createElement("slot"));
    }
    constructor(options, animations) {
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
    pause() { } // TODO
    unpause() { } // TODO
    toggle() { } // TODO
    restart() { } // TODO
}
exports.FunText = FunText;
//# sourceMappingURL=index.js.map