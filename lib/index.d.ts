import type { Options, Animation } from "types";
export default class FunText {
    #private;
    get isBuild(): boolean;
    get isMounted(): boolean;
    constructor(options: Options, animations: Animation[]);
    build(): this;
    set text(text: string | null | undefined);
    mount(): this;
    unmount(): this;
    pause(): void;
    unpause(): void;
    toggle(): void;
    restart(): void;
}
