# Input action

Input action library for web applications.

This library allows managing and handling keyboard actions such as shortcuts. It may support gamepads in the future.

Features:

* Reflect actions
* Shortcut display text
* Pooling of pressed keys

## Getting started

```ts
import { input } from "@hydroperx/inputaction";

input.setActions({
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

input.on("inputPressed", () => {
    // use isPressed() or justPressed()
    const shouldMoveRight = input.justPressed("moveRight");
});
```