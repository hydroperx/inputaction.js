import clonePlainObject from "./util/clonePlainObject";
import { InputActionAtom, InputActionKey, InputActionKeyName, navigatorKeyToThis } from "./InputAction";
import assert from "assert";
import { TypedEventTarget } from "@hydroper/typedeventtarget";

/**
 * The `Input` class handles action mapping and user input event listening.
 * 
 * # Getting started
 * 
 * The following code demonstrates using arrows and WASD keys
 * for entity movement:
 * 
 * ```ts
 * import { Input } from "com.hydroper.webinputaction";
 *
 * Input.input.setActions({
 *     "moveLeft": [
 *         { key: "a" },
 *         { key: "leftArrow" },
 *     ],
 *     "moveRight": [
 *         { key: "d" },
 *         { key: "rightArrow" },
 *     ],
 *     "moveUp": [
 *         { key: "w" },
 *         { key: "upArrow" },
 *     ],
 *     "moveDown": [
 *         { key: "s" },
 *         { key: "downArrow" },
 *     ],
 * });
 *
 * Input.input.addEventListener("inputPressed", () => {
 *     const shouldMoveRight = Input.input.isPressed("moveRight");
 * });
 * ```
 * 
 * # Built-in actions
 * 
 * The following actions are pre-defined in every action map
 * and can be overriden:
 * 
 * * `escape` - Used for escaping out in the user interface.
 * * `navigateLeft` — Used for focusing the left neighbor of an user interface control.
 * * `navigateRight` — Used for focusing the right neighbor of an user interface control.
 * * `navigateUp` — Used for focusing the top neighbor of an user interface control.
 * * `navigateDown` — Used for focusing the bottom neighbor of an user interface control.
 * 
 * # Events
 * 
 * This class extends `EventTarget` and may dispatch the following events:
 * 
 * ```ts
 * // Dispatched when user input starts being pressed or
 * // is continuously pressed.
 * inputPressed: Event;
 * // Dispatched when any user input is released.
 * inputReleased: Event;
 * // Dispatched when the actions map is updated.
 * actionsUpdated: Event;
 * ```
 */
export default class Input extends (EventTarget as TypedEventTarget<{
    inputPressed: Event;
    inputReleased: Event;
    actionsUpdated: Event;
}>) {
    /**
     * The singleton instance of the `Input` class.
     */
    public static readonly input = new Input;

    // Actions map
    private mMap: Record<string, InputActionAtom[]> = {
        ...Input.builtin(),
    };

    /**
     * Returns the current action map in read-only mode.
     */
    public getActions(): Record<string, InputActionAtom[]> {
        return clonePlainObject(this.mMap, true);
    }

    /**
     * Updates the action map.
     * @fires Input#actionsUpdated
     */
    public setActions(map: Record<string, InputActionAtom[]>) {
        // Update static map
        this.mMap = {
            ...Input.builtin(),
            ...clonePlainObject(map, true),
        };

        // Dispatch update event
        this.dispatchEvent(new Event("actionsUpdated"));
    }

    private static builtin(): Record<string, InputActionAtom[]> {
        return {
            "escape": [ { key: "escape" } ],
            "navigateLeft": [ { key: "leftArrow" } ],
            "navigateRight": [ { key: "rightArrow" } ],
            "navigateUp": [ { key: "upArrow" } ],
            "navigateDown": [ { key: "downArrow" } ],
        };
    }

    // Static pressed state pool
    private static readonly mPressedStatePoolKeys: Map<InputActionKeyName, PressedState> = new Map();

    static {
        window.addEventListener("keydown", evt => {
            const keyName = navigatorKeyToThis(evt.key);
            if (keyName !== undefined) {
                // Mutate pressed state
                let state = Input.mPressedStatePoolKeys.get(keyName);
                if (state === undefined) {
                    state = {
                        pressed: false,
                        pressedTimestamp: 0,
                        control: false,
                        shift: false,
                        alt: false,
                    };
                    Input.mPressedStatePoolKeys.set(keyName, state);
                }
                state.pressed = true;
                state.pressedTimestamp = Date.now();
                state.control = evt.ctrlKey;
                state.shift = evt.shiftKey;
                state.alt = evt.altKey;

                // Dispatch pressed event
                Input.input.dispatchEvent(new Event("inputPressed"));
            }
        });

        window.addEventListener("keyup", evt => {
            const keyName = navigatorKeyToThis(evt.key);
            if (keyName !== undefined) {
                // Mutate pressed state
                let state = Input.mPressedStatePoolKeys.get(keyName);
                if (state === undefined) {
                    state = {
                        pressed: false,
                        pressedTimestamp: 0,
                        control: false,
                        shift: false,
                        alt: false,
                    };
                    Input.mPressedStatePoolKeys.set(keyName, state);
                }
                state.pressed = false;
                state.control = false;
                state.shift = false;
                state.alt = false;

                // Dispatch released event
                Input.input.dispatchEvent(new Event("inputReleased"));
            }
        });
    }

    /**
     * Determines whether an action is pressed.
     * @throws Error Thrown if the action does not exist.
     */
    public isPressed(name: string): boolean {
        const action = this.mMap[name];
        assert(action !== undefined, "The specified action for Input.isPressed(name) does not exist.");
        for (const item of action!) {
            if (item.hasOwnProperty("key")) {
                const inputActionKey = item as InputActionKey;
                const pressedState = Input.mPressedStatePoolKeys.get(inputActionKey.key);
                const pressed = pressedState !== undefined && pressedState.pressed
                    && (inputActionKey.control ? pressedState.control : !pressedState.control)
                    && (inputActionKey.shift ? pressedState.shift : !pressedState.shift)
                    && (inputActionKey.alt ? pressedState.alt : !pressedState.alt);
                if (pressed) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Determines whether an action has been just pressed right now.
     * @throws Error Thrown if the action does not exist.
     */
    public justPressed(name: string): boolean {
        const action = this.mMap[name];
        assert(action !== undefined, "The specified action for Input.isPressed(name) does not exist.");
        for (const item of action!) {
            if (item.hasOwnProperty("key")) {
                const inputActionKey = item as InputActionKey;
                const pressedState = Input.mPressedStatePoolKeys.get(inputActionKey.key);
                const pressed = pressedState !== undefined && pressedState.pressed
                    && (inputActionKey.control ? pressedState.control : !pressedState.control)
                    && (inputActionKey.shift ? pressedState.shift : !pressedState.shift)
                    && (inputActionKey.alt ? pressedState.alt : !pressedState.alt);
                if (pressed && pressedState.pressedTimestamp > Date.now() - 15) {
                    return true;
                }
            }
        }
        return false;
    }
}

type PressedState = {
    pressed: boolean,
    pressedTimestamp: number,
    control: boolean,
    shift: boolean,
    alt: boolean,
};