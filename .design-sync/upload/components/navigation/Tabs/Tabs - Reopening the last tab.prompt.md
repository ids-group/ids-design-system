# Tabs - reopening the last tab

rememberLastTab stores the active tab per path in sessionStorage, so returning to a record reopens where you left it. Off by default, and it only does anything alongside urlParam, which supplies the names — a remembered INDEX would repoint the moment a tab is inserted, for the same reason the parameter carries names rather than numbers.

A link always wins. The parameter is read first; memory only fills the gap the first tab deliberately leaves, since that case writes no parameter at all. Tab one is remembered too — otherwise going back to it would be forgotten, and the next visit would reopen the tab before it. Session storage rather than local, so tomorrow is a fresh visit rather than a stale one, and every access is guarded: Safari in private mode throws on write, and a strip that cannot store simply stops remembering.

Full API: `Tabs.d.ts`. How to use the component anywhere: `Tabs.prompt.md`.
