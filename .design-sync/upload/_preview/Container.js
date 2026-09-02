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

  // .design-sync/previews/Container.tsx
  var Container_exports = {};
  __export(Container_exports, {
    PageContent: () => PageContent,
    Sizes: () => Sizes
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var strip = (label) => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        padding: "10px 12px",
        background: "var(--surface-secondary)",
        border: "1px dashed var(--border-default)",
        borderRadius: 6,
        font: "500 13px/1.4 var(--font-sans)",
        color: "var(--text-secondary)",
        textAlign: "center"
      }
    },
    label
  );
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface-sunken, var(--surface-secondary))", padding: "16px 0", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Container, { size: "sm" }, strip('size="sm" \u2014 caps at 640px, centered')), /* @__PURE__ */ React.createElement("div", { style: { height: 16 } }), /* @__PURE__ */ React.createElement(import_ids_design_system.Container, { size: "md" }, strip('size="md" \u2014 caps at 768px')), /* @__PURE__ */ React.createElement("div", { style: { height: 16 } }), /* @__PURE__ */ React.createElement(import_ids_design_system.Container, { size: "full" }, strip('size="full" \u2014 no cap, padding only')));
  var PageContent = () => /* @__PURE__ */ React.createElement(import_ids_design_system.Container, { size: "md" }, /* @__PURE__ */ React.createElement("div", { className: "t-overline" }, "Depot report"), /* @__PURE__ */ React.createElement("h3", { className: "t-h4", style: { margin: "4px 0" } }, "Leeds central depot \u2014 week 30"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: "0 0 12px", color: "var(--text-secondary)" } }, "Throughput held at 1,240 pallets across 86 trunk runs. Two delayed departures on Thursday due to M62 congestion; both recovered same-day."), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "md" }, /* @__PURE__ */ React.createElement("div", { className: "t-overline" }, "Utilisation"), /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "4px 0" } }, "Dock doors 92% \xB7 Fleet 18 of 22"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Peak window 06:00\u201309:40 \xB7 quietest bay: 7 (rear yard)")));
  return __toCommonJS(Container_exports);
})();
