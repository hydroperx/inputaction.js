import {
  InputActionAtom,
  InputActionKey,
  InputActionKeyName,
  navigatorKeyToThis,
} from "./InputAction";
import assert from "assert";
import { TypedEventTarget } from "@hydroperx/event";

/**
 * The `Input` class handles action mapping and user input event listening.
 *
 * # Getting started
 *
 * The following code demonstrates using arrows and WASD keys
 * for entity movement:
 *
 * ```ts
 * import { input } from "@hydroperx/inputaction";
 *
 * input.setActions({
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
 * input.on("inputPressed", () => {
 *     const shouldMoveRight = input.isPressed("moveRight");
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
export default class Input extends (EventTarget as TypedEventTarget<InputEventMap>) {
  /**
   * The singleton instance of the `Input` class.
   */
  public static readonly input = new Input();

  /**
   * Returns the display text of a shortcut, such as `"Ctrl+A"`.
   *
   * @param param Either an action name or a series of action atoms.
   */
  public static display(param: string | InputActionAtom[]): string {
    if (typeof param == "string") {
      return Input.display(input.getActions()[param]);
    }
    if (!param) return "";
    for (const atom of param as InputActionAtom[]) {
      if (atom.hasOwnProperty("key")) {
        const key = atom as InputActionKey;
        const parts = [];
        if (key.control) {
          parts.push("Ctrl");
        }
        if (key.alt) {
          parts.push("Alt");
        }
        if (key.shift) {
          parts.push("Shift");
        }
        parts.push(Input.keyNameDisplay(key.key));
        return parts.join("+");
      }
    }
    return "";
  }

  /**
   * Returns the display text of an individual key name.
   */
  public static keyNameDisplay(name: InputActionKeyName): string {
    switch (name) {
      case "escape":
        return "Esc";
      case "leftArrow":
        return "Left";
      case "rightArrow":
        return "Right";
      case "upArrow":
        return "Up";
      case "downArrow":
        return "Down";
      case "spacebar":
        return "Space";
      case "enter":
        return "Enter";
      case "backspace":
        return "Backspace";
      case "minus":
        return "Minus";
      case "plus":
        return "Plus";
      case "tab":
        return "Tab";
      case "assign":
        return "=";
      case "comma":
        return ",";
      case "dot":
        return ".";
      case "semicolon":
        return ";";
      default:
        return name.toUpperCase();
    }
  }

  // Actions map
  private mMap: Record<string, InputActionAtom[]> = {
    ...Input.builtin(),
  };

  /**
   * Returns the current action map in read-only mode.
   */
  public getActions(): Record<string, InputActionAtom[]> {
    return structuredClone(this.mMap);
  }

  /**
   * Updates the action map.
   * @fires Input#actionsUpdated
   */
  public setActions(map: Record<string, InputActionAtom[]>) {
    // Update static map
    this.mMap = {
      ...Input.builtin(),
      ...structuredClone(map),
    };

    // Dispatch update event
    this.dispatchEvent(new Event("actionsUpdated"));
  }

  private static builtin(): Record<string, InputActionAtom[]> {
    return {
      escape: [{ key: "escape" }],
      navigateLeft: [{ key: "leftArrow" }],
      navigateRight: [{ key: "rightArrow" }],
      navigateUp: [{ key: "upArrow" }],
      navigateDown: [{ key: "downArrow" }],
    };
  }

  // Static pressed state pool
  private static readonly mPressedStatePoolKeys: Map<
    InputActionKeyName,
    PressedState
  > = new Map();

  static {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", (evt) => {
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
          const evt1 = new Event("inputPressed", { cancelable: true });
          const r = input.dispatchEvent(evt1);
          if (evt1.defaultPrevented) {
            evt.preventDefault();
          }
          return r;
        }
      });

      window.addEventListener("keyup", (evt) => {
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
          const evt1 = new Event("inputReleased", { cancelable: true });
          const r = input.dispatchEvent(evt1);
          if (evt1.defaultPrevented) {
            evt.preventDefault();
          }
          return r;
        }
      });
    }
  }

  /**
   * Determines whether an action is pressed.
   * @throws Error Thrown if the action does not exist.
   */
  public isPressed(name: string): boolean {
    const action = this.mMap[name];
    assert(
      action !== undefined,
      "The specified action for Input.isPressed(name) does not exist.",
    );
    for (const item of action!) {
      if (item.hasOwnProperty("key")) {
        const inputActionKey = item as InputActionKey;
        const pressedState = Input.mPressedStatePoolKeys.get(
          inputActionKey.key,
        );
        const pressed =
          pressedState !== undefined &&
          pressedState.pressed &&
          (inputActionKey.control
            ? pressedState.control
            : !pressedState.control) &&
          (inputActionKey.shift ? pressedState.shift : !pressedState.shift) &&
          (inputActionKey.alt ? pressedState.alt : !pressedState.alt);
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
    assert(
      action !== undefined,
      "The specified action for Input.isPressed(name) does not exist.",
    );
    for (const item of action!) {
      if (item.hasOwnProperty("key")) {
        const inputActionKey = item as InputActionKey;
        const pressedState = Input.mPressedStatePoolKeys.get(
          inputActionKey.key,
        );
        const pressed =
          pressedState !== undefined &&
          pressedState.pressed &&
          (inputActionKey.control
            ? pressedState.control
            : !pressedState.control) &&
          (inputActionKey.shift ? pressedState.shift : !pressedState.shift) &&
          (inputActionKey.alt ? pressedState.alt : !pressedState.alt);
        if (pressed && pressedState.pressedTimestamp > Date.now() - 15) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Shortcut for the `addEventListener()` method.
   */
  public on<T extends keyof InputEventMap>(
    type: T,
    listener: (event: (InputEventMap[T] extends Event ? InputEventMap[T] : never)) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  public on(type: string, listener: Function, options?: boolean | AddEventListenerOptions): void;

  public on(type: string, listener: Function, options?: boolean | AddEventListenerOptions) {
    this.addEventListener(type as any, listener as any, options);
  }

  /**
   * Shortcut for the `removeEventListener()` method.
   */
  public off<T extends keyof InputEventMap>(
    type: T,
    listener: (event: (InputEventMap[T] extends Event ? InputEventMap[T] : never)) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  public off(type: string, listener: Function, options?: boolean | EventListenerOptions): void;

  public off(type: string, listener: Function, options?: boolean | EventListenerOptions) {
    this.removeEventListener(type as any, listener as any, options);
  }
}

/**
 * Event types dispatched by `Input`.
 */
export type InputEventMap = {
  inputPressed: Event;
  inputReleased: Event;
  actionsUpdated: Event;
};

type PressedState = {
  pressed: boolean;
  pressedTimestamp: number;
  control: boolean;
  shift: boolean;
  alt: boolean;
};

/**
 * The singleton instance of the `Input` class.
 */
export const input = Input.input;