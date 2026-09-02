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

  // .design-sync/previews/Input.tsx
  var Input_exports = {};
  __export(Input_exports, {
    Affordances: () => Affordances,
    Basic: () => Basic,
    FloatingLabel: () => FloatingLabel,
    Sizes: () => Sizes,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 16, width: 320 };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Email address", placeholder: "you@company.co.uk", hint: "Work email preferred." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Company", placeholder: "IDS Group Ltd", required: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "VAT number", placeholder: "GB 123 4567 89", optional: true }));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Username", value: "mikhail.shyshla", invalid: true, hint: "This username is already taken." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Delivery postcode", value: "EC1A 1BB", success: "We deliver to this area." }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Account ID", value: "IDS-0042", disabled: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Reference", value: "PO-2026-1183", readOnly: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Domain", value: "ids-group", loading: true, hint: "Checking availability\u2026" }));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { size: "sm", label: "Small", placeholder: "32px control" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { size: "md", label: "Medium", placeholder: "40px control" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { size: "lg", label: "Large", placeholder: "48px control" }));
  var FloatingLabel = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Recipient name", value: "Amelia Barnes" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Phone", placeholder: " " }));
  var Affordances = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { type: "search", ariaLabel: "Search shipments", placeholder: "Search shipments\u2026", value: "fragile" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { type: "password", label: "Password", value: "hunter2-rosebud", passwordToggle: true }), /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Tracking note", value: "Leave at the side gate", maxLength: 40 }));
  return __toCommonJS(Input_exports);
})();
