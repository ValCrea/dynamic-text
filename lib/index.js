"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunText = void 0;
function quoteString(str) {
    return typeof str === "string" ? `"${str}"` : str;
}
class FunText {
    static #splitScope = {
        all: null,
        sentence: "\n",
        word: " ",
        letter: "",
    };
    static #defaultCss = "position: relative;display:inline-block;margin:0;padding:0;white-space:pre;";
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
        const isNewLine = split === "\n";
        const texts = split ? content.split(split) : [content];
        let nodes = [];
        texts.forEach((text, index) => {
            if (isNewLine) {
                nodes.push(FunText.#elementBuilder("p", text));
            }
            else {
                nodes = [...nodes, ...FunText.#nodeBuilder("\n", text)];
            }
            if (split && index < texts.length - 1) {
                nodes.push(FunText.#elementBuilder(isNewLine ? "br" : "p", split));
            }
        });
        return nodes;
    }
    /*static #animationCompiler(animation: Animation): CompiledAnimation {
  
      const steps: { [key: number]: string } = {};
  
      return {
        type: animation.type,
  
      };
    }*/
    /*static #animationsCompiler(animations: Animation[]): CompiledAnimation[] {
      return [{ type: animations[0].type }, { type: animations[1].type }];
    }*/
    static #animationBuilder(animation) {
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
    static #animationsBuilder(animation) {
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
    #scope;
    #container;
    #shadow;
    #text;
    #nodes;
    #style;
    #animations;
    #buildNodes() {
        this.#nodes = FunText.#nodeBuilder(FunText.#splitScope[this.#scope], this.#text);
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
    }
    constructor(options, animations) {
        this.#scope = options.scope;
        this.#container = options.container;
        this.#text = options.text || this.#container.innerText;
        this.#nodes = [];
        this.#animations = animations;
        this.#buildNodes();
        this.#buildStyle();
        this.#buildShadow();
        let test = ["a", 1];
        console.log(typeof test);
        console.log(test instanceof Array);
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
    pause() { }
    unpause() { }
    toggle() { }
    restart() { }
}
exports.FunText = FunText;
//# sourceMappingURL=index.js.map