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

  // .design-sync/previews/Card.tsx
  var Card_exports = {};
  __export(Card_exports, {
    DashboardCard: () => DashboardCard,
    Elevations: () => Elevations,
    Paddings: () => Paddings
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var grid = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: 16,
    alignItems: "start"
  };
  var cardInner = (title) => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "t-overline" }, "Shipment"), /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "4px 0" } }, title), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Leeds LS1 4AP \u2192 Manchester M1 2AB \xB7 14 pallets"));
  var Elevations = () => /* @__PURE__ */ React.createElement("div", { style: grid }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { padding: "md" }, cardInner("ORD-2026-0142")), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "md" }, cardInner("ORD-2026-0156")), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "hover", padding: "md" }, cardInner("ORD-2026-0161")), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "interactive", padding: "md" }, cardInner("ORD-2026-0178")));
  var Paddings = () => /* @__PURE__ */ React.createElement("div", { style: { ...grid, gridTemplateColumns: "repeat(3, minmax(180px, 1fr))" } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "sm" }, cardInner("ORD-2026-0142")), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "md" }, cardInner("ORD-2026-0156")), /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "lg" }, cardInner("ORD-2026-0161")));
  var DashboardCard = () => /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 360 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Card, { elevation: "raised", padding: "md" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "t-overline" }, "Delivery run"),
    /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "In transit")
  ), /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "0 0 4px" } }, "Trunk run \xB7 Depot 12 \u2192 Depot 4"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Driver Amelia Barnes \xB7 departed 06:40 \xB7 ETA 11:15. 22 drops across Sheffield S1 2HE and Rotherham S60 1TG."), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "t-caption" }, "Updated 4m ago"),
    /* @__PURE__ */ React.createElement("span", { className: "t-s link" }, "View manifest")
  )));
  return __toCommonJS(Card_exports);
})();
