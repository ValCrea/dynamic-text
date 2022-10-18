"use strict";

const replace = document.getElementById("replace");
const funtext = document.createElement("p");
funtext.innerText = "Fun text!";
try {
  replace.parentNode.replaceChild(funtext, replace);
} catch (err) {
  console.error("FunTextError: Couldn't replace element\n" + err);
}

class FunText {
  static allTargets = ["all", "sentence", "word", "letter"];

  #calculateOffset(currentCount, totalCount, currentLen, totalLen) {}

  #createtShadowDOM() {}
  #removeShadowDOM() {}

  constructor() {
    this.#target = null;

    this.#options = {
      onStart: null,
      onEnd: null,
    };
  }

  build(target, animations, options) {}

  mount() {}

  unmount() {}

  pause(index) {
    if (this.#target === "all" && index > 0) {
    }
  }

  unpause() {}

  toggle() {}

  restart() {}
}
