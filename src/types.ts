export type Scope = "all" | "sentence" | "word" | "letter"; // "custom"
export type AnimationType =
  | "horizontal"
  | "vertical"
  | "color"
  | "background"
  | "opacity";

export type Options = {
  text?: string;
  scope: Scope;
  container: HTMLElement;
};

export type Animation = {
  type: AnimationType;
  steps: string | [string, string] | { [key: number]: string };

  duration?: number | `${number}s` | `${number}ms`;
  delay?: number | `${number}s` | `${number}ms`;
  iteration?: number | string | "infinite";
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  timing?:
    | "ease"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "linear"
    | "step-start"
    | "step-end";
  // `custom:${string}`
  fill?: "none" | "forwards" | "backwards" | "both" | "initial" | "inherit";

  offset?: number;
  /*| ((
        curInd: number,
        maxInd: number,
        curLen: number,
        maxLen: number
      ) => number);*/
  sync?: "none" | "start" | "end";
};

export type CompiledAnimation = {
  type: string;
  steps: { [key: string]: string };
  duration: string;
  delay: string;
  iteration: string;
  direction: string;
  timing: string;
  fill: string;
};
