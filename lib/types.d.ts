export declare type Scope = "all" | "sentence" | "word" | "letter";
export declare type AnimationType = "horizontal" | "vertical" | "color" | "background" | "opacity";
export declare type Sync = {
    time: number;
    to: "start" | "end";
};
export declare type Options = {
    text?: string;
    scope: Scope;
    container: HTMLElement;
};
export declare type Animation = {
    type: AnimationType;
    steps: string | [string, string] | {
        [key: number]: string;
    };
    duration?: number | `${number}s` | `${number}ms`;
    delay?: number | `${number}s` | `${number}ms`;
    iteration?: number | string | "infinite";
    direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
    timing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear" | "step-start" | "step-end";
    fill?: "none" | "forwards" | "backwards" | "both" | "initial" | "inherit";
    offset?: number;
    sync?: Sync;
};
export declare type CompiledAnimation = {
    type: AnimationType;
    steps: {
        [key: string]: string;
    };
    duration: string;
    delay: string;
    iteration: string;
    direction: string;
    timing: string;
    fill: string;
    offset: number;
};
