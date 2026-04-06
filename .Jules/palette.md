## 2024-04-16 - [Accessibility & Feedback]
**Learning:** Adding `aria-describedby` dynamically to custom UI components like cards significantly enhances the screen reader experience by linking descriptive text to the interactive element, while tooltips (using the `title` attribute) and tactile CSS feedback (`:active` with `transform: scale()`) provide necessary guidance and responsiveness for mouse users.
**Action:** Always ensure custom interactive elements have linked descriptive context (`aria-describedby`) and clear active visual states in the future.
