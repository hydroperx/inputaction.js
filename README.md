# Input action

<p align="center">
  <a href="https://jsr.io/@hydroper/inputaction"><img src="https://img.shields.io/jsr/v/@hydroper/inputaction"></a>
  <a href="https://jsr.io/@hydroper/inputaction/doc"><img src="https://img.shields.io/badge/API%20Documentation-gray"></a>
</p>

Input action library for web applications.

This library allows managing and handling keyboard actions such as shortcuts. It may support gamepads in the future.

Features:

* Reflect actions
* Shortcut display text
* Pooling of pressed keys

## Getting started

```ts
import { Input } from "@hydroper/inputaction";

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