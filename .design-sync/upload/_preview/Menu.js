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

  // .design-sync/previews/Menu.tsx
  var Menu_exports = {};
  __export(Menu_exports, {
    Canonical: () => Canonical,
    InPopover: () => InPopover,
    States: () => States,
    SubmenuOpen: () => SubmenuOpen,
    WithShortcuts: () => WithShortcuts
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Shortcut = ({ keys }) => /* @__PURE__ */ React.createElement(
    "span",
    {
      style: {
        position: "absolute",
        right: 12,
        color: "var(--text-tertiary)",
        fontSize: 12,
        fontWeight: 400
      }
    },
    keys
  );
  var Canonical = () => /* @__PURE__ */ React.createElement("div", { style: { width: 224 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "users" }, "Profile settings"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "settings" }, "Preferences"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "bell" }, "Notifications"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuDivider, null), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "x", error: true }, "Sign out")));
  var WithShortcuts = () => /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 248 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "edit" }, "Rename route", /* @__PURE__ */ React.createElement(Shortcut, { keys: "F2" })), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "copy" }, "Duplicate", /* @__PURE__ */ React.createElement(Shortcut, { keys: "Ctrl+D" })), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "download" }, "Export manifest", /* @__PURE__ */ React.createElement(Shortcut, { keys: "Ctrl+E" })), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuDivider, null), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "trash", error: true }, "Delete route", /* @__PURE__ */ React.createElement(Shortcut, { keys: "Del" }))));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: { width: 224 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "edit" }, "Rename"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "copy", disabled: true }, "Duplicate"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "download" }, "Export"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuDivider, null), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "trash", error: true }, "Delete job")));
  var SubmenuOpen = () => /* @__PURE__ */ React.createElement("div", { style: { paddingRight: 180 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 224 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "edit" }, "Rename"), /* @__PURE__ */ React.createElement(
    import_ids_design_system.MenuItem,
    {
      icon: "copy",
      submenu: /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, null, "PDF"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, null, "CSV"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, null, "Excel (.xlsx)"))
    },
    "Export as"
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "download" }, "Download"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuDivider, null), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "x", error: true }, "Delete"))));
  var InPopover = () => /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", flexDirection: "column", gap: 8, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", trailingIcon: "chevronDown" }, "Account"), /* @__PURE__ */ React.createElement(import_ids_design_system.Popover, null, /* @__PURE__ */ React.createElement("div", { style: { width: 224 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Menu, null, /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "users" }, "Profile settings"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "settings" }, "Preferences"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "bell" }, "Notifications"), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuDivider, null), /* @__PURE__ */ React.createElement(import_ids_design_system.MenuItem, { icon: "x", error: true }, "Sign out")))));
  return __toCommonJS(Menu_exports);
})();
