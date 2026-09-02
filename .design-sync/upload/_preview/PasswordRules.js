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

  // .design-sync/previews/PasswordRules.tsx
  var PasswordRules_exports = {};
  __export(PasswordRules_exports, {
    AllMet: () => AllMet,
    Empty: () => Empty,
    Partial: () => Partial,
    TwoColumns: () => TwoColumns
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var rules = [
    { label: "At least 8 characters", test: (value) => value.length >= 8 },
    { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
    { label: "One number", test: (value) => /\d/.test(value) },
    { label: "One symbol", test: (value) => /[^A-Za-z0-9]/.test(value) }
  ];
  var col = { display: "grid", gap: 20, width: 420 };
  var Empty = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.PasswordRules, { value: "", rules, listId: "pw-empty" }));
  var Partial = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.PasswordRules, { value: "Shipment1", rules, listId: "pw-partial" }));
  var AllMet = () => /* @__PURE__ */ React.createElement("div", { style: col }, /* @__PURE__ */ React.createElement(import_ids_design_system.PasswordRules, { value: "Shipment1!", rules, listId: "pw-met" }));
  var TwoColumns = () => /* @__PURE__ */ React.createElement("div", { style: { width: 420 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.PasswordRules, { value: "Shipment1", rules, columns: 2, listId: "pw-cols" }));
  return __toCommonJS(PasswordRules_exports);
})();
