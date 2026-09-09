# Sidenav - a group that is also a page

Without routerLink the whole header only opens the group — a heading that navigates closes the page being read the moment someone reaches for the section beneath it. Set it and the group becomes a destination as well as a container: the header navigates, and the caret splits off into its own control, because one control cannot both go somewhere and stay to open something.

<ds-sidenav-group expandable [routerLink]="reportsRoute">

Full API: `Sidenav.d.ts`. How to use the component anywhere: `Sidenav.prompt.md`.
