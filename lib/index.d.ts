import type { Options, Animation } from "types";
export declare class FunText {
    #private;
    constructor(options: Options, animations: Animation[]);
    mount(): this;
    unmount(): this;
    pause(): void;
    unpause(): void;
    toggle(): void;
    restart(): void;
}
