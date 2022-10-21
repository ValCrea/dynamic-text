export type Scope = "all" | "sentence" | "word" | "letter"; // TODO custom
export type Options = {
  text?: string;
  scope: Scope;
  container: HTMLElement;
};

export type TimeUnit = number | `${number}s` | `${number}ms`;
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
  time: TimeUnit; // TODO string
  to: "start" | "end"; // TODO middle, number
};
export type OffsetCalculator = (
  curInd: number,
  maxInd: number,
  curLen: number,
  maxLen: number
) => number;

export type Animation = {
  type: AnimationType;
  steps: string | [string, string] | Steps;

  duration?: TimeUnit;
  delay?: TimeUnit;
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

  offset?: TimeUnit | OffsetCalculator;
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
  offset: number | OffsetCalculator;
};
