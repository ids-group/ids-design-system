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

  // .design-sync/previews/LoadingOverlay.tsx
  var LoadingOverlay_exports = {};
  __export(LoadingOverlay_exports, {
    HeaderInset: () => HeaderInset,
    NoBlur: () => NoBlur,
    Saving: () => Saving
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--border-default)",
    font: "400 13px/1.5 var(--font-sans)"
  };
  var muted = { color: "var(--text-secondary)" };
  var Shipments = () => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...rowStyle, fontWeight: 600, ...muted } }, /* @__PURE__ */ React.createElement("span", null, "Consignment"), /* @__PURE__ */ React.createElement("span", null, "Destination")), /* @__PURE__ */ React.createElement("div", { style: rowStyle }, /* @__PURE__ */ React.createElement("span", null, "IDS-48211"), /* @__PURE__ */ React.createElement("span", { style: muted }, "EC1A 1BB \xB7 London")), /* @__PURE__ */ React.createElement("div", { style: rowStyle }, /* @__PURE__ */ React.createElement("span", null, "IDS-48214"), /* @__PURE__ */ React.createElement("span", { style: muted }, "M1 4AE \xB7 Manchester")), /* @__PURE__ */ React.createElement("div", { style: { ...rowStyle, borderBottom: "none" } }, /* @__PURE__ */ React.createElement("span", null, "IDS-48219"), /* @__PURE__ */ React.createElement("span", { style: muted }, "LS1 5QS \xB7 Leeds")));
  var Saving = () => /* @__PURE__ */ React.createElement("div", { style: { width: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { padding: "md" }, /* @__PURE__ */ React.createElement(import_ids_design_system.LoadingOverlay, { loading: true, label: "Saving allocations\u2026" }, /* @__PURE__ */ React.createElement(Shipments, null))));
  var NoBlur = () => /* @__PURE__ */ React.createElement("div", { style: { width: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { padding: "md" }, /* @__PURE__ */ React.createElement(import_ids_design_system.LoadingOverlay, { loading: true, blur: false, spinnerSize: "sm" }, /* @__PURE__ */ React.createElement(Shipments, null))));
  var HeaderInset = () => /* @__PURE__ */ React.createElement("div", { style: { width: 400 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { padding: "md" }, /* @__PURE__ */ React.createElement(import_ids_design_system.LoadingOverlay, { loading: true, insetTop: "40px", label: "Refreshing\u2026" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        height: 40,
        display: "flex",
        alignItems: "center",
        font: "700 14px/1 var(--font-sans)",
        borderBottom: "1px solid var(--border-default)"
      }
    },
    "Today's collections \u2014 Barking depot"
  ), /* @__PURE__ */ React.createElement(Shipments, null))));
  return __toCommonJS(LoadingOverlay_exports);
})();
