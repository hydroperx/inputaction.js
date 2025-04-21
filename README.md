# Input action

Input action library for web applications.

This library allows managing and handling keyboard actions such as shortcuts. It may support gamepads in the future.

Features:

* Reflect actions
* Shortcut display text
* Pooling of pressed keys

## Getting started

```ts
import { Input } from "@hydroperx/inputaction";

Input.input.setActions({
    "moveLeft": [
        { key: "a" },
        { key: "leftArrow" },
    ],
    "moveRight": [
        { key: "d" },
        { key: "rightArrow" },
    ],
    "moveUp": [
        { key: "w" },
        { key: "upArrow" },
    ],
    "moveDown": [
        { key: "s" },
        { key: "downArrow" },
    ],
});

Input.input.addEventListener("inputPressed", () => {
    // use isPressed() or justPressed()
    const shouldMoveRight = Input.input.justPressed("moveRight");
});
```