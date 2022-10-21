type timeUnit = number | `${number}s` | `${number}ms`;

export type Scope = "all" | "sentence" | "word" | "letter"; // TODO custom
export type Options = {
  text?: string;
  scope: Scope;
  container: HTMLElement;
};

export type AnimationType =
  | "horizontal"
  | "vertical"
  | "color"
  | "background"
  | "opacity"
  | "scale"
  | "rotation";
export type Steps = { [key: number]: string | string[] };
export type Sync = {
  time: timeUnit; // TODO string
  to: "start" | "end"; // TODO middle, number
};
export type offsetCalculator = (
  curInd: number,
  maxInd: number,
  curLen: number,
  maxLen: number
) => number;

export type Animation = {
  type: AnimationType;
  steps: string | [string, string] | Steps;

  duration?: timeUnit;
  delay?: timeUnit;
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
  // TODO `custom:${string}`
  fill?: "none" | "forwards" | "backwards" | "both" | "initial" | "inherit";

  offset?: timeUnit; // TODO
  /*| ((
        curInd: number,
        maxInd: number,
        curLen: number,
        maxLen: number
      ) => number);*/
  sync?: Sync; // TODO more stuff
};
export type CompiledAnimation = {
  type: AnimationType;
  steps: Steps;
  duration: string;
  delay: string;
  iteration: string;
  direction: string;
  timing: string;
  fill: string;
  offset: number;
};
