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

  // .design-sync/previews/ColorPicker.tsx
  var ColorPicker_exports = {};
  __export(ColorPicker_exports, {
    Basic: () => Basic,
    OpenCustomPresets: () => OpenCustomPresets,
    OpenPanel: () => OpenPanel
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 320 };
  var routePalette = [
    "#16A34A",
    "#2F54FF",
    "#DC2626",
    "#D97706",
    "#7C3AED",
    "#0891B2",
    "#DB2777",
    "#65A30D"
  ];
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.ColorPicker, { ariaLabel: "Brand colour", value: "#2F54FF" }), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ColorPicker,
    {
      ariaLabel: "Accent colour",
      value: "#0EA5E9",
      hint: "Used for charts and route highlights."
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.ColorPicker,
    {
      ariaLabel: "Alert colour",
      value: "#EAB308",
      invalid: true,
      hint: "Colour does not meet contrast requirements."
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.ColorPicker, { ariaLabel: "Fleet colour", value: "#6B7280", disabled: true }));
  var OpenPanel = () => /* @__PURE__ */ React.createElement(import_ids_design_system.ColorPicker, { ariaLabel: "Brand colour", value: "#2F54FF" });
  var OpenCustomPresets = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.ColorPicker,
    {
      ariaLabel: "Route label colour",
      value: "#16A34A",
      presets: routePalette,
      hint: "Route colour on the depot map."
    }
  );
  return __toCommonJS(ColorPicker_exports);
})();
