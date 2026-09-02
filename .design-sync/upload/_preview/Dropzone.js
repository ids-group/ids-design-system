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

  // .design-sync/previews/Dropzone.tsx
  var Dropzone_exports = {};
  __export(Dropzone_exports, {
    Disabled: () => Disabled,
    DragOver: () => DragOver,
    Idle: () => Idle,
    SingleFile: () => SingleFile,
    UploadQueue: () => UploadQueue
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var wrap = { maxWidth: 480 };
  var MetaHint = ({ children }) => React.createElement("p", { hint: "" }, children);
  var Idle = () => /* @__PURE__ */ React.createElement("div", { style: wrap }, /* @__PURE__ */ React.createElement(import_ids_design_system.Dropzone, { accept: ".pdf,.png,.jpg", multiple: true, hint: /* @__PURE__ */ React.createElement(MetaHint, null, "PDF \xB7 PNG \xB7 JPG \u2014 max 10 MB per file") }));
  var DragOver = () => /* @__PURE__ */ React.createElement("div", { style: wrap }, /* @__PURE__ */ React.createElement(import_ids_design_system.Dropzone, { multiple: true }));
  var UploadQueue = () => {
    const files = [
      { id: "f-1", name: "delivery-manifest-LDS02.pdf", size: 2516582, state: "uploading", progress: 65, message: "uploading 65%" },
      { id: "f-2", name: "proof-of-delivery-48211.jpg", size: 1842003, state: "success", progress: 100, message: "uploaded" },
      { id: "f-3", name: "driver-rota-week-31.xlsx", size: 13002342, state: "error", progress: 0, message: "exceeds 10 MB limit" },
      { id: "f-4", name: "damage-report-TR118.docx", size: 482133, state: "queued", progress: 0 }
    ];
    return /* @__PURE__ */ React.createElement("div", { style: wrap }, /* @__PURE__ */ React.createElement(import_ids_design_system.Dropzone, { multiple: true, files }));
  };
  var SingleFile = () => /* @__PURE__ */ React.createElement("div", { style: wrap }, /* @__PURE__ */ React.createElement(import_ids_design_system.Dropzone, { single: true, hint: /* @__PURE__ */ React.createElement(MetaHint, null, "PNG \xB7 JPG \xB7 max 5 MB \xB7 one image only") }));
  var Disabled = () => /* @__PURE__ */ React.createElement("div", { style: wrap }, /* @__PURE__ */ React.createElement(import_ids_design_system.Dropzone, { disabled: true }));
  return __toCommonJS(Dropzone_exports);
})();
