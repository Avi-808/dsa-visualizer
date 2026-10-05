# DSA Studio

An interactive, dependency-free visualizer for learning how sorting algorithms work. Adjust the array and playback speed, then watch comparisons, swaps, pivots, and sorted positions update one step at a time.

**[Open the live demo](https://avi-808.github.io/dsa-visualizer/)**

## Algorithms

| Algorithm | Average time | Extra space | Notes |
| --- | --- | --- | --- |
| Bubble sort | O(n²) | O(1) | Stable; compares adjacent values |
| Selection sort | O(n²) | O(1) | In-place; selects the next minimum |
| Insertion sort | O(n²) | O(1) | Stable; effective for small or nearly sorted arrays |
| Quick sort | O(n log n) | O(log n) average | In-place partitioning; O(n²) worst case |

The visualizer supports shuffle, adjustable array size, adjustable playback speed, pause/resume, reset, and single-step playback.

## Run it

Open `index.html` in a modern browser. No package installation or build step is needed. The fonts load from Google Fonts; the app itself has no runtime dependencies.

To publish it with GitHub Pages, open the repository's **Settings → Pages**, choose the `main` branch and `/ (root)` folder, then save.

## Project structure

```text
index.html   Accessible page structure and controls
style.css    Responsive layout and visual design
app.js       Sorting operation generation and playback
```

## Learning goals

- Compare how different algorithms move values through an array.
- Connect operation counts with time complexity.
- Explore the tradeoff between simple quadratic algorithms and divide-and-conquer sorting.
- Read a small, framework-free front-end project organized into clear files.

## License

MIT. See [LICENSE](LICENSE).

