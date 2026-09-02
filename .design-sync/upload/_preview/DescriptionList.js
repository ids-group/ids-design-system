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

  // .design-sync/previews/DescriptionList.tsx
  var DescriptionList_exports = {};
  __export(DescriptionList_exports, {
    CopyValues: () => CopyValues,
    Horizontal: () => Horizontal,
    Stacked: () => Stacked
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Horizontal = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 520 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionList, { orientation: "horizontal" }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Status" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "In transit")), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Order" }, "ORD-2026-0142"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Customer" }, "Whitfield & Co Ltd"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Origin" }, "Depot 12 \xB7 Leeds LS1 4AP"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Destination" }, "Manchester M1 2AB"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Booked" }, "18 Jul 2026 \xB7 14 pallets")));
  var Stacked = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 360 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionList, { orientation: "stacked" }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Status" }, /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "In transit")), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Driver" }, "Amelia Barnes \xB7 Route 12"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Delivery instructions" }, "Rear loading bay off Whitworth Street \u2014 book in at the gatehouse and ask for goods-in before 15:00."), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "ETA" }, "24 Jul 2026, 14:30")));
  var CopyValues = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 520 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionList, { orientation: "horizontal" }, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Tracking ref", copyValue: "TRK-GB-2026-0142-8817" }, "TRK-GB-2026-0142-8817"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Consignment ID", copyValue: "cons_01J8KQPVXZ3R5TNMW4BGHF6YDE" }, "cons_01J8KQPVXZ\xB7\xB7\xB76YDE")));
  return __toCommonJS(DescriptionList_exports);
})();
