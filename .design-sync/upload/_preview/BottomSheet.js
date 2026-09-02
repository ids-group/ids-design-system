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

  // .design-sync/previews/BottomSheet.tsx
  var BottomSheet_exports = {};
  __export(BottomSheet_exports, {
    ActionSheet: () => ActionSheet,
    EditRegistration: () => EditRegistration,
    SnapPoints: () => SnapPoints
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var phone = {
    position: "relative",
    transform: "translateZ(0)",
    overflow: "hidden",
    width: 380,
    height: 480,
    borderRadius: 12,
    border: "1px solid var(--border-default)"
  };
  var pageBehind = /* @__PURE__ */ React.createElement("div", { style: { padding: 20 } }, /* @__PURE__ */ React.createElement("h4", { className: "t-h5", style: { margin: "0 0 4px" } }, "Run 22 \u2014 8 drops left"), /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Next: 14 Finsbury Sq, London EC1A 1BB \xB7 ETA 16:40."));
  var EditRegistration = () => /* @__PURE__ */ React.createElement("div", { style: phone }, pageBehind, /* @__PURE__ */ React.createElement(
    import_ids_design_system.BottomSheet,
    {
      title: "Edit registration",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { fullWidth: true }, "Save"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { fullWidth: true, color: "neutral", variant: "outline" }, "Cancel"))
    },
    /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Update the vehicle registration. Changes apply to the current event only."),
    /* @__PURE__ */ React.createElement(import_ids_design_system.Input, { label: "Registration", value: "YK24 XQL" })
  ));
  var SnapPoints = () => /* @__PURE__ */ React.createElement("div", { style: phone }, pageBehind, /* @__PURE__ */ React.createElement(
    import_ids_design_system.BottomSheet,
    {
      title: "Filter results",
      snapPoints: [0.35, 0.65, 0.9],
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { fullWidth: true }, "Apply filters")
    },
    /* @__PURE__ */ React.createElement("p", { className: "t-s", style: { margin: 0 } }, "Drag the handle to snap between 35%, 65% and 90% of the viewport height. Drag past the lowest stop to close.")
  ));
  var ActionSheet = () => /* @__PURE__ */ React.createElement("div", { style: phone }, pageBehind, /* @__PURE__ */ React.createElement(
    import_ids_design_system.BottomSheet,
    {
      title: "Order ORD-2026-0142",
      actions: /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { fullWidth: true, color: "neutral", variant: "outline" }, "Close")
    },
    /* @__PURE__ */ React.createElement(import_ids_design_system.List, { dividers: false }, /* @__PURE__ */ React.createElement(
      import_ids_design_system.ListItem,
      {
        clickable: true,
        title: "Track shipment",
        leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "truck", size: 20 })
      }
    ), /* @__PURE__ */ React.createElement(
      import_ids_design_system.ListItem,
      {
        clickable: true,
        title: "Edit delivery notes",
        leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "edit", size: 20 })
      }
    ), /* @__PURE__ */ React.createElement(
      import_ids_design_system.ListItem,
      {
        clickable: true,
        title: "Report an issue",
        leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "flag", size: 20 })
      }
    ), /* @__PURE__ */ React.createElement(
      import_ids_design_system.ListItem,
      {
        clickable: true,
        title: "Cancel order",
        leading: /* @__PURE__ */ React.createElement(import_ids_design_system.Icon, { name: "trash", size: 20 })
      }
    ))
  ));
  return __toCommonJS(BottomSheet_exports);
})();
