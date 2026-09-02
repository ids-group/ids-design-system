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

  // .design-sync/previews/Slider.tsx
  var Slider_exports = {};
  __export(Slider_exports, {
    Basic: () => Basic,
    Range: () => Range,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 24, width: 340 };
  var labelRow = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8
  };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Vehicle load"), /* @__PURE__ */ React.createElement("span", null, "65%")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { value: 65, min: 0, max: 100, ariaLabel: "Vehicle load" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Max parcel weight"), /* @__PURE__ */ React.createElement("span", null, "18 kg")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { value: 18, min: 0, max: 30, ariaLabel: "Max parcel weight" })));
  var Range = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Delivery charge band"), /* @__PURE__ */ React.createElement("span", null, "\xA34 \u2013 \xA312")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { range: true, value: [4, 12], min: 0, max: 25, ariaLabel: "Delivery charge band" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Collection window"), /* @__PURE__ */ React.createElement("span", null, "08:00 \u2013 14:00")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { range: true, value: [8, 14], min: 6, max: 20, ariaLabel: "Collection window" })));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Route density"), /* @__PURE__ */ React.createElement("span", null, "40 drops")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { value: 40, min: 0, max: 80, hint: "Drops assigned per round.", ariaLabel: "Route density" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Route density"), /* @__PURE__ */ React.createElement("span", null, "78 drops")), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Slider,
    {
      value: 78,
      min: 0,
      max: 80,
      invalid: true,
      hint: "Exceeds the safe drops-per-round limit.",
      ariaLabel: "Route density \u2014 error"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: labelRow }, /* @__PURE__ */ React.createElement("span", null, "Vehicle load"), /* @__PURE__ */ React.createElement("span", null, "50%")), /* @__PURE__ */ React.createElement(import_ids_design_system.Slider, { value: 50, min: 0, max: 100, disabled: true, ariaLabel: "Vehicle load \u2014 locked" })));
  return __toCommonJS(Slider_exports);
})();
