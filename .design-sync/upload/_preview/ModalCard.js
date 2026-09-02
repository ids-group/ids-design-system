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

  // .design-sync/previews/ModalCard.tsx
  var ModalCard_exports = {};
  __export(ModalCard_exports, {
    Danger: () => Danger,
    Standard: () => Standard,
    WithIcon: () => WithIcon
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Standard = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.ModalCard,
    {
      title: "Reassign driver",
      showClose: false,
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Cancel"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Reassign"))
    },
    "Move run 22 from Amelia Barnes to the on-call driver for tonight only? The manifest and POD chain stay with the run."
  );
  var WithIcon = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.ModalCard,
    {
      title: "Assign vehicle",
      icon: "truck",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Not now"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, null, "Assign YK24 XQL"))
    },
    "Tractor unit YK24 XQL is free after the 14:20 tip at Sheffield S1 2HE and fits the trailer class for this load."
  );
  var Danger = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.ModalCard,
    {
      title: "Scrap manifest?",
      status: "error",
      icon: "warn",
      showClose: false,
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline" }, "Keep manifest"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "error" }, "Scrap"))
    },
    "Manifest MAN-0491 and its 22 drop confirmations will be deleted. Drivers already en route are not notified."
  );
  return __toCommonJS(ModalCard_exports);
})();
