# Tree view - interactive tree

Pass TreeNode[] (id, label, icon?, children?, disabled?). [(expandedIds)] and [(selectedId)] are two-way; (nodeSelected) emits the whole node. Clicking a parent selects and toggles it.

One tab stop. ArrowUp/Down move, Home/End jump, ArrowRight expands then steps in, ArrowLeft collapses then goes to the parent, Enter/Space select.

Selected: ()

Full API: `Tree.d.ts`. How to use the component anywhere: `Tree.prompt.md`.
