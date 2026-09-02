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

  // .design-sync/previews/Divider.tsx
  var Divider_exports = {};
  __export(Divider_exports, {
    Horizontal: () => Horizontal,
    Labelled: () => Labelled,
    Vertical: () => Vertical
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Horizontal = () => /* @__PURE__ */ React.createElement("div", { style: { width: 320 }, className: "t-s" }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "ORD-2026-0142 \xB7 Leeds LS1 4AP"), /* @__PURE__ */ React.createElement(import_ids_design_system.Divider, null), /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "ORD-2026-0156 \xB7 Manchester M1 2AB"), /* @__PURE__ */ React.createElement(import_ids_design_system.Divider, { variant: "strong", spacing: "lg" }), /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "ORD-2026-0161 \xB7 Sheffield S1 2HE"));
  var Labelled = () => /* @__PURE__ */ React.createElement("div", { style: { width: 320 }, className: "t-s" }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "ORD-2026-0178 \xB7 delivered 09:12"), /* @__PURE__ */ React.createElement(import_ids_design_system.Divider, { variant: "label" }, "Earlier deliveries"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "ORD-2026-0142 \xB7 delivered yesterday"));
  var Vertical = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 }, className: "t-s" }, /* @__PURE__ */ React.createElement("span", null, "Depot 12 \xB7 Leeds"), /* @__PURE__ */ React.createElement(import_ids_design_system.Divider, { variant: "vertical", spacing: "none" }), /* @__PURE__ */ React.createElement("span", null, "14 pallets"), /* @__PURE__ */ React.createElement(import_ids_design_system.Divider, { variant: "vertical", spacing: "none" }), /* @__PURE__ */ React.createElement("span", null, "ETA 11:15"));
  return __toCommonJS(Divider_exports);
})();
