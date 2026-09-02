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

  // .design-sync/previews/RadioGroup.tsx
  var RadioGroup_exports = {};
  __export(RadioGroup_exports, {
    Basic: () => Basic,
    Disabled: () => Disabled,
    Validation: () => Validation
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 24, width: 340 };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.RadioGroup, { label: "Service level", hint: "Prices are per parcel, ex VAT.", value: "next-day" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "next-day", label: "Next day before 10:30" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "end-of-day", label: "Next day by end of day" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "standard", label: "Standard (2\u20133 working days)" })));
  var Validation = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.RadioGroup, { label: "Collection depot", hint: "Choose a depot to release the order.", invalid: true }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "leeds", label: "Leeds \u2014 Cross Green" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "birmingham", label: "Birmingham \u2014 Aston" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "bristol", label: "Bristol \u2014 Avonmouth" })));
  var Disabled = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.RadioGroup, { label: "Billing account", hint: "Managed by your account administrator.", value: "ids-ops", disabled: true }, /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "ids-ops", label: "IDS Operations Ltd" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Radio, { value: "ids-freight", label: "IDS Freight (EU) B.V." })));
  return __toCommonJS(RadioGroup_exports);
})();
