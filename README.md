# minifier-repl

## Motivation
See how terser/uglify remove dead code across versions. E.g. what it can or can not remove.

## Prior arts
https://github.com/Rich-Harris/terser-playground

https://xem.github.io/terser-online/ 

Unfortunately they are pretty primitive and don't meet all my requirements.

## TODOs:
- ~~Basic UI that takes input code and output minified code using terser~~
- ~~Support options simple - take a JSON blob~~
- Support options advanced - let people enable/disable options using checkboxes
- ~~Support multiple terser versions~~
- Support sharing URL
- Various UI improvements
    - code highlight
    - prettify layout with css
    - ~~default value in version selection dropdown~~
    - show spinner while initializing states from persistence
- Clean up TODOs in code
- ~~Accept relaxed JSON object as configuration~~
- ~~Persistence~~
- debounce user inputs