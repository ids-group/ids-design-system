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

  // .design-sync/previews/Drawer.tsx
  var Drawer_exports = {};
  __export(Drawer_exports, {
    LeftPanel: () => LeftPanel,
    ShipmentDetail: () => ShipmentDetail
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var miniViewport = {
    position: "relative",
    transform: "translateZ(0)",
    overflow: "hidden",
    height: 480,
    borderRadius: 8,
    border: "1px solid var(--border-default)"
  };
  var pageBehind = /* @__PURE__ */ React.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "0 0 4px" } }, "Live runs \u2014 Barking depot"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "22 drops in progress \xB7 3 delayed \xB7 next departure 14:20."), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: "8px 0 0" } }, "IDS-48211 \xB7 London EC1A 1BB \u2014 out for delivery", /* @__PURE__ */ React.createElement("br", null), "IDS-48214 \xB7 Manchester M1 4AE \u2014 at depot", /* @__PURE__ */ React.createElement("br", null), "IDS-48219 \xB7 Leeds LS1 5QS \u2014 delayed"));
  var ShipmentDetail = () => /* @__PURE__ */ React.createElement("div", { style: miniViewport }, pageBehind, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Drawer,
    {
      title: "Shipment IDS-48211",
      placement: "right",
      size: "md",
      drawerFooter: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Cancel"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Save changes"))
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Badge, { withDot: true }, "Out for delivery"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionList, null, /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Reference", copyValue: "IDS-48211" }, "IDS-48211"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Collection" }, "Barking depot \xB7 IG11 8BL"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Delivery" }, "14 Finsbury Sq, London EC1A 1BB"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Driver" }, "Amelia Barnes"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "Vehicle" }, "YK24 XQL \xB7 18t rigid"), /* @__PURE__ */ React.createElement(import_ids_design_system.DescriptionItem, { term: "ETA" }, "Today, 16:40")), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Site contact asked for a call 30 minutes ahead. Tail-lift required \u2014 no dock at the delivery address."))
  ));
  var LeftPanel = () => /* @__PURE__ */ React.createElement("div", { style: miniViewport }, pageBehind, /* @__PURE__ */ React.createElement(
    import_ids_design_system.Drawer,
    {
      title: "Filter runs",
      placement: "left",
      size: "sm",
      drawerFooter: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Clear"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Apply filters"))
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { checked: true, label: "Delayed only" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { label: "Include completed drops" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { checked: true, label: "Night trunk runs" }), /* @__PURE__ */ React.createElement(import_ids_design_system.Checkbox, { label: "Third-party carriers" }))
  ));
  return __toCommonJS(Drawer_exports);
})();
