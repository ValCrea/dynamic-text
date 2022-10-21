export declare type Scope = "all" | "sentence" | "word" | "letter";
export declare type Options = {
    text?: string;
    scope: Scope;
    container: HTMLElement;
};
export declare type TimeUnit = number | `${number}s` | `${number}ms`;
export declare type AnimationType = "horizontal" | "vertical" | "color" | "background" | "opacity" | "scale" | "rotation";
export declare type Steps = {
    [key: number]: string | string[];
};
export declare type Sync = {
    time: TimeUnit;
    to: "start" | "end";
};
export declare type OffsetCalculator = (curInd: number, maxInd: number, curLen: number, maxLen: number) => number;
export declare type Animation = {
    type: AnimationType;
    steps: string | [string, string] | Steps;
    duration?: TimeUnit;
    delay?: TimeUnit;
    iteration?: number | string | "infinite";
    direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    timing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear" | "step-start" | "step-end";
    fill?: "none" | "forwards" | "backwards" | "both" | "initial" | "inherit";
    offset?: TimeUnit | OffsetCalculator;
    sync?: Sync;
};
export declare type CompiledAnimation = {
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
