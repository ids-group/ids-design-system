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

  // .design-sync/previews/OtpInput.tsx
  var OtpInput_exports = {};
  __export(OtpInput_exports, {
    Alphanumeric: () => Alphanumeric,
    Basic: () => Basic,
    MaskedPin: () => MaskedPin,
    States: () => States
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var col = { display: "grid", gap: 20, justifyItems: "start" };
  var Basic = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.OtpInput,
    {
      length: 6,
      value: "482",
      ariaLabel: "Delivery verification code",
      hint: "Enter the 6-digit code from the consignee's SMS."
    }
  ));
  var MaskedPin = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.OtpInput, { length: 4, mask: true, value: "7301", ariaLabel: "Driver terminal PIN" }));
  var Alphanumeric = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.OtpInput, { length: 6, mode: "alphanumeric", value: "Q7K2FD", ariaLabel: "Collection reference" }));
  var States = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(
    import_ids_design_system.OtpInput,
    {
      length: 6,
      value: "119402",
      invalid: true,
      ariaLabel: "Delivery verification code \u2014 error",
      hint: "That code is incorrect. Ask the consignee to resend it."
    }
  ), /* @__PURE__ */ React.createElement(import_ids_design_system.OtpInput, { length: 6, value: "52", disabled: true, ariaLabel: "Delivery verification code \u2014 disabled" }));
  return __toCommonJS(OtpInput_exports);
})();
