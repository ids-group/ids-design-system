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

  // .design-sync/previews/Skeleton.tsx
  var Skeleton_exports = {};
  __export(Skeleton_exports, {
    CardPlaceholder: () => CardPlaceholder,
    Shapes: () => Shapes,
    TextLines: () => TextLines
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var TextLines = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8, width: 320 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "100%", height: "14px" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "100%", height: "14px" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "60%", height: "14px" }));
  var Shapes = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "center" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "40px", height: "40px", circle: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "64px", height: "64px", circle: true }), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, className: "t-s" }, "ETA ", /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { inline: true, width: "48px", height: "12px" })));
  var CardPlaceholder = () => /* @__PURE__ */ React.createElement("div", { style: { width: 320 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "md" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", marginBottom: 12 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "40px", height: "40px", circle: true }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 6, flex: 1 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "70%", height: "14px" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "40%", height: "12px" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "100%", height: "12px" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "100%", height: "12px" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Skeleton, { width: "55%", height: "12px" }))));
  return __toCommonJS(Skeleton_exports);
})();
