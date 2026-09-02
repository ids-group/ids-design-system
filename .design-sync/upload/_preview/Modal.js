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

  // .design-sync/previews/Modal.tsx
  var Modal_exports = {};
  __export(Modal_exports, {
    DangerConfirm: () => DangerConfirm,
    FormModal: () => FormModal,
    ImpactWarning: () => ImpactWarning,
    OverScrim: () => OverScrim,
    Sizes: () => Sizes
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var stack = {
    display: "grid",
    gap: 10,
    justifyItems: "start"
  };
  var caption = { marginTop: 4 };
  var cancel = /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Cancel");
  var FormModal = () => /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { staticPreview: true, size: "md", title: "Edit delivery slot", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Save changes")) }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Consignment", value: "IDS-48211 \xB7 14 pallets" }), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Input,
    {
      label: "Delivery window",
      value: "09:00 \u2013 12:00",
      hint: "Driver calls the site contact 30 minutes ahead."
    }
  ), /* @__PURE__ */ React.createElement(
    import_ids_design_system.Select,
    {
      label: "Depot",
      value: "leeds",
      options: [
        { label: "Leeds \u2014 LS1 4AP", value: "leeds" },
        { label: "Manchester \u2014 M1 2AB", value: "manchester" },
        { label: "Sheffield \u2014 S1 2HE", value: "sheffield" }
      ]
    }
  )));
  var Sizes = () => /* @__PURE__ */ React.createElement("div", { style: stack }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { staticPreview: true, size: "sm", title: "Quick confirm", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Confirm")) }, "Tight modal for binary confirmations and short messages."), /* @__PURE__ */ React.createElement("div", { className: "t-caption", style: caption }, "sm \xB7 480 px")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { staticPreview: true, size: "md", title: "Edit order ORD-2026-0156", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Save")) }, "Default size for most edits, detail dialogs and confirmations."), /* @__PURE__ */ React.createElement("div", { className: "t-caption", style: caption }, "md \xB7 640 px")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { staticPreview: true, size: "lg", title: "Run manifest report", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Run report")) }, "Wider canvas for forms, multi-column previews, and bulk-edit dialogs."), /* @__PURE__ */ React.createElement("div", { className: "t-caption", style: caption }, "lg \xB7 800 px")));
  var DangerConfirm = () => /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { staticPreview: true, size: "sm", status: "error", title: "Delete waypoint?", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "error" }, "Delete")) }, "This cannot be undone. 12 resource allocations at Rotherham S60 1TG will be released back to the pool.");
  var ImpactWarning = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Modal,
    {
      staticPreview: true,
      size: "md",
      title: "Confirm recompute",
      impact: /* @__PURE__ */ React.createElement(import_ids_design_system.Banner, { variant: "severe", title: "Affected records" }, /* @__PURE__ */ React.createElement("ul", { className: "list" }, /* @__PURE__ */ React.createElement("li", null, "Route Alpha \xB7 3 logistics plans"), /* @__PURE__ */ React.createElement("li", null, "Route Beta \xB7 8 resource allocations"), /* @__PURE__ */ React.createElement("li", null, "Route Gamma \xB7 1 sub-record"))),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Recompute & save"))
    },
    "Saving these dates will recompute downstream allocations across three routes."
  );
  var OverScrim = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        position: "relative",
        transform: "translateZ(0)",
        overflow: "hidden",
        height: 420,
        borderRadius: 8,
        border: "1px solid var(--border-default)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "0 0 4px" } }, "Tonight\u2019s trunk runs \u2014 Barking depot"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Depot 12 \u2192 Depot 4 \xB7 22 drops \xB7 departs 06:40 \xB7 driver Amelia Barnes."), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: "8px 0 0" } }, "Bay 14 is double-booked from 07:00; the 07:10 arrival from Leeds LS1 4AP is holding.")),
    /* @__PURE__ */ React.createElement(import_ids_design_system.Modal, { size: "sm", title: "Release booked slot?", actions: /* @__PURE__ */ React.createElement(React.Fragment, null, cancel, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Release slot")) }, "Releasing slot 14 frees the bay for the 07:10 arrival from Leeds LS1 4AP. The current booking moves to the standby queue.")
  );
  return __toCommonJS(Modal_exports);
})();
