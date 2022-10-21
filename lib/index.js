"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
  UTILITIES
*/
// Generates object keys and numbers instead of strings
function* numberKeys(object) {
    const keys = Object.keys(object);
    for (const k of keys)
        yield parseFloat(k);
}
/*
  |‾‾‾  |   |  |\  |    ‾‾|‾‾  |‾‾‾  \  /  ‾‾|‾‾
  |‾‾   |   |  | \ |      |    |—     \\     |
  |     |___|  |  \|      |    |___  /  \    |
*/
class FunText {
    /*static #animationProperties = ["name", "duration", "delay", "iteration"]
    static #animationFunctionNames = ["name", "duration", "delay", "iteration-count", "direction", "timing-function", "fill-mode"];*/
    /*#calculateOffset(currentCount, totalCount, currentLen, totalLen) {}
    #syncAnimations() {}*/
    /*
      WARNINGS AND ERRORS
    */
    static #warning(...args) {
        console.warn("FunTextWarning:", ...args);
    }
    static #error(...args) {
        throw Error("FunTextError: " + [...args].join(" "));
    }
    /*
      INPUT OPTIONS
    */
    // Sorts input options in class variables
    #parseOptions(options) {
        this.#scope = options.scope;
        this.#container = options.container;
        this.#text = options.text ?? this.#container.innerHTML;
    }
    /*
      INPUT ANIMATION
    */
    // Time unit to second conversion
    static #animationTimeConvert = {
        s: 1,
        ms: 0.001,
    };
    // Sync keyword to percentage
    static #animationSyncTo = {
        start: 0,
        middle: 50,
        end: 100,
    };
    // Converts unidentified type to string with default fallback
    static #typeDeterminator(variable, def) {
        return !variable
            ? def
            : typeof variable === "string"
                ? variable
                : `${variable}`;
    }
    // Gets the time value in seconds as a number from TimeUnit type
    static #timeExtractor(variable, def) {
        variable = variable ?? def;
        if (typeof variable === "number") {
            return variable;
        }
        const timeUnit = variable.replace(/[0-9]/g, "");
        const timeConversion = FunText.#animationTimeConvert[timeUnit] ?? 1;
        let timeValue = parseFloat(variable.replace(/[^0-9 | . | -]/g, ""));
        timeValue = isNaN(timeValue) ? def : timeValue;
        return timeValue * timeConversion;
    }
    // Converts input animation into a more program firendly format
    static #animationCompiler(animation) {
        const type = animation.type;
        let steps = {};
        if (typeof animation.steps === "string") {
            steps[0] = ["inherit", "0"];
            steps[100] = animation.steps;
        }
        else if (animation.steps instanceof Array) {
            steps[0] = animation.steps[0];
            steps[100] = animation.steps[1];
        }
        else {
            for (const key of numberKeys(animation.steps)) {
                steps[key] = animation.steps[key];
            }
        }
        const iteration = FunText.#typeDeterminator(animation.iteration, "1");
        const direction = animation.direction || "normal";
        const timing = animation.timing || "ease-in-out";
        const fill = animation.fill || "none";
        let duration = FunText.#timeExtractor(animation.duration, 1);
        const delay = FunText.#timeExtractor(animation.delay, 0);
        let offset;
        if (typeof animation.offset === "function") {
            offset = animation.offset;
        }
        else {
            offset = FunText.#timeExtractor(animation.offset, 0);
        }
        if (animation.sync) {
            const time = FunText.#timeExtractor(animation.sync.time, 1);
            const ratio = duration / time;
            const move = (FunText.#animationSyncTo[animation.sync.to] ?? animation.sync.to) *
                (1 - ratio);
            const syncedSteps = {};
            for (const key of numberKeys(steps)) {
                syncedSteps[key * ratio + move] = steps[key];
            }
            // TODO check if redundant
            if (!syncedSteps[0]) {
                syncedSteps[0] = ["inherit", "0"];
            }
            if (!syncedSteps[100]) {
                const lastStep = Math.max(...Array.from(numberKeys(syncedSteps)));
                syncedSteps[100] = syncedSteps[lastStep];
            }
            steps = syncedSteps;
            duration = time;
        }
        return {
            type,
            steps,
            duration: `${duration}s`,
            delay: `${delay}s`,
            iteration,
            direction,
            timing,
            fill,
            offset,
        };
    }
    // Converts and sets all input animations
    #compileAnimations(animations) {
        this.#animations = [];
        for (const animation of animations) {
            this.#animations.push(FunText.#animationCompiler(animation));
        }
    }
    /*
      DOM NODES
    */
    // Ways to split text depending on the scope
    static #scopeSplit = {
        all: null,
        sentence: "\n",
        word: " ",
        letter: "",
    };
    // Creates a dom element with default styling
    static #elementBuilder(type, content) {
        const element = document.createElement(type);
        element.innerText = content;
        element.classList.add("funtext");
        return element;
    }
    // Splits input text into nodes dependin on the scope
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
    // Creates the default offset calcualtor
    static #offsetCalculatorDefault(offset) {
        const offsetCalculator = (curInd, maxInd, curLen, maxLen) => {
            return curInd * offset;
        };
        return offsetCalculator;
    }
    // Calculates animation offset for all nodes of the given animation
    #calculateNodeVariables(animation) {
        let curNode = null;
        const animationName = `--offset-${animation.type}`;
        let offsetCalculator;
        if (typeof animation.offset === "number") {
            offsetCalculator = FunText.#offsetCalculatorDefault(animation.offset);
        }
        else {
            offsetCalculator = animation.offset;
        }
        let curLen = 0;
        const maxLen = this.#text.length;
        const maxInd = this.#nodes.length;
        for (let curInd = 0; curInd < maxInd; curInd++) {
            curNode = this.#nodes[curInd];
            curNode.style.setProperty(animationName, `${offsetCalculator(curInd, maxInd, curLen, maxLen)}s`);
            curLen += curNode.innerText.length;
        }
    }
    // Builds and sets nodes and their variables
    #buildNodes() {
        this.#nodes = FunText.#nodeBuilder(FunText.#scopeSplit[this.#scope], this.#text);
        for (const animation of this.#animations) {
            this.#calculateNodeVariables(animation);
        }
    }
    /*
      STYLE
    */
    // Properties that animation types target
    static #animationTarget = {
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
    static #keyframeBuilder(animation) {
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
    static #animationBuilder(animations) {
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
    /*
      INIT
    */
    #scope;
    #container;
    #text;
    #animations;
    #nodes;
    #style;
    #shadow;
    #isBuild;
    get isBuild() {
        return this.#isBuild;
    }
    #isMounted;
    get isMounted() {
        return this.#isMounted;
    }
    // TODO
    /*#isDetached: boolean;
    get isMisDetachedunted() {
      return this.#isDetached;
    }*/
    constructor(options, animations) {
        this.#isBuild = false;
        this.#isMounted = false;
        this.#parseOptions(options);
        this.#compileAnimations(animations);
    }
    /*
      BUILD
    */
    build() {
        this.#isBuild = true;
        this.#buildNodes();
        this.#buildStyle();
        this.#buildShadow();
        return this;
    }
    /*
      REFACTOR
    */
    // Runs given commands while taking state into account
    #refactor(commands) {
        const wasMounted = this.#isMounted;
        if (wasMounted) {
            this.unmount();
        }
        for (const command of commands) {
            command();
        }
        if (wasMounted) {
            this.mount();
        }
    }
    set text(text) {
        this.#text = text ?? this.#container.innerHTML;
        if (!this.#isBuild) {
            return;
        }
        this.#refactor([this.#buildNodes.bind(this)]);
    }
    set options(options) {
        const isNewContainer = options.container !== this.#container;
        if (isNewContainer && this.#isMounted) {
            FunText.#error("Cannot switch containers while mounted");
        }
        this.#parseOptions(options);
        if (!this.#isBuild) {
            return;
        }
        let commands = [];
        if (isNewContainer) {
            commands = [this.#buildShadow.bind(this), this.#buildNodes.bind(this)];
        }
        else {
            commands = [this.#buildNodes.bind(this)];
        }
        this.#refactor(commands);
    }
    /*
      MOUNT
    */
    mount() {
        if (!this.#isBuild) {
            FunText.#error("Object bust be build before mounting");
        }
        if (this.#isMounted) {
            FunText.#warning("Object laready mounted");
            return this;
        }
        this.#isMounted = true;
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
        if (!this.#isBuild) {
            FunText.#error("Object must be build before unmounting");
        }
        if (!this.#isMounted) {
            FunText.#warning("Object laready unmounted");
            return this;
        }
        this.#isMounted = false;
        this.#shadow.innerHTML = "";
        this.#shadow.appendChild(document.createElement("slot"));
        return this;
    }
    /*
      UNMOUNT
    */
    detach() { } // TODO
    /*
      MANIPULATE ANIMATION
    */
    pause() { } // TODO
    unpause() { } // TODO
    toggle() { } // TODO
    restart() { } // TODO
}
exports.default = FunText;
//# sourceMappingURL=index.js.map