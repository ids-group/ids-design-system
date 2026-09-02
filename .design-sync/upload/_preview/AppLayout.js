"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // host:react
  var require_react = __commonJS({
    "host:react"(exports, module) {
      module.exports = window.React;
    }
  });

  // host:ds
  var require_ds = __commonJS({
    "host:ds"(exports, module) {
      module.exports = window.IdsDs;
    }
  });

  // .design-sync/previews/AppLayout.tsx
  var AppLayout_exports = {};
  __export(AppLayout_exports, {
    FullShell: () => FullShell,
    TopbarFullSpan: () => TopbarFullSpan
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var frame = (height) => ({
    "--ds-app-layout-height": `${height}px`,
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    overflow: "hidden"
  });
  var rail = (collapsed) => /* @__PURE__ */ React.createElement(import_ids_design_system.Sidenav, { brand: "Dispatch", logoLetter: "D", collapsed }, /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "home", label: "Dashboard", active: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "truck", label: "Shipments", badge: 12 }), /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "map", label: "Depots" }), /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "users", label: "Drivers", hasAlert: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavGroup, { label: "Admin" }, /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "chart", label: "Reports" }), /* @__PURE__ */ React.createElement(import_ids_design_system.SidenavItem, { icon: "settings", label: "Settings" })), /* @__PURE__ */ React.createElement(
    import_ids_design_system.SidenavFooter,
    {
      userName: "Amelia Barnes",
      userRole: "Dispatch manager",
      alerts: true,
      collapsed
    }
  ));
  var bar = /* @__PURE__ */ React.createElement(
    import_ids_design_system.Topbar,
    {
      title: "Dashboard",
      search: /* @__PURE__ */ React.createElement(
        import_ids_design_system.Search,
        {
          placeholder: "Search shipments, drivers, depots\u2026",
          shortcut: "\u2318K",
          ariaLabel: "Search"
        }
      ),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "help", ariaLabel: "Help", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.IconButton, { icon: "bell", ariaLabel: "Notifications", size: "sm" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Avatar, { initials: "AB", size: "sm" }))
    }
  );
  var content = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "t-overline" }, "Operations"), /* @__PURE__ */ React.createElement("h2", { className: "t-h3", style: { margin: "4px 0" } }, "Today\u2019s dispatch"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: "0 0 16px", color: "var(--text-secondary)" } }, "Friday 24 July \u2014 3 trunk runs in progress, 2 vehicles held at Leeds LS1 4AP."), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12
      }
    },
    /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "sm" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Active shipments", value: 42, delta: 6, deltaLabel: "vs yesterday" })),
    /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "sm" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "On-time rate", value: "94.2", unit: "%", delta: -1.4, deltaLabel: "vs last week" })),
    /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "sm" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Stat, { label: "Vehicles on road", value: 18, caption: "of 22 available" }))
  ));
  var FullShell = () => /* @__PURE__ */ React.createElement("div", { style: frame(600) }, /* @__PURE__ */ React.createElement(import_ids_design_system.AppLayout, { sidenav: rail(false), topbar: bar }, content));
  var TopbarFullSpan = () => /* @__PURE__ */ React.createElement("div", { style: frame(600) }, /* @__PURE__ */ React.createElement(import_ids_design_system.AppLayout, { topbarSpan: "full", sidenav: rail(true), topbar: bar }, content));
  return __toCommonJS(AppLayout_exports);
})();
