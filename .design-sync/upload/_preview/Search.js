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

  // .design-sync/previews/Search.tsx
  var Search_exports = {};
  __export(Search_exports, {
    Basic: () => Basic,
    Clearable: () => Clearable,
    NoIcon: () => NoIcon,
    WithShortcut: () => WithShortcut
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 360 };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Search, { placeholder: "Search shipments, drivers, depots\u2026", ariaLabel: "Search" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Search, { value: "IDS-88412", ariaLabel: "Search" }));
  var WithShortcut = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Search, { placeholder: "Search shipments, drivers, depots\u2026", shortcut: "\u2318K", ariaLabel: "Search" }));
  var Clearable = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Search, { value: "Amelia Barnes", clearable: true, ariaLabel: "Search drivers" }));
  var NoIcon = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Search, { placeholder: "Filter routes\u2026", showIcon: false, shortcut: "/", ariaLabel: "Filter routes" }));
  return __toCommonJS(Search_exports);
})();
