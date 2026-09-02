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

  // .design-sync/previews/Icon.tsx
  var Icon_exports = {};
  __export(Icon_exports, {
    CommonIcons: () => CommonIcons,
    IconSizes: () => IconSizes
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var common = [
    "search",
    "plus",
    "check",
    "x",
    "chevronDown",
    "chevronRight",
    "menu",
    "info",
    "warn",
    "error",
    "success",
    "bell",
    "settings",
    "user",
    "users",
    "home",
    "calendar",
    "truck",
    "box",
    "map",
    "folder",
    "edit",
    "trash",
    "copy",
    "download",
    "upload",
    "eye",
    "filter",
    "star",
    "clock"
  ];
  var CommonIcons = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 96px)", gap: 12 } }, common.map((name) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: name,
      style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 11 }
    },
    /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name, size: 20 }),
    /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-secondary)" } }, name)
  )));
  var IconSizes = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "center" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "bell", size: 14 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "bell", size: 16 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "bell", size: 20 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "bell", size: 24 }), /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "bell", size: 32 }));
  return __toCommonJS(Icon_exports);
})();
