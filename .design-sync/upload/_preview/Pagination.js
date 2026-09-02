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

  // .design-sync/previews/Pagination.tsx
  var Pagination_exports = {};
  __export(Pagination_exports, {
    Boundaries: () => Boundaries,
    Default: () => Default,
    MidRange: () => MidRange,
    SizeSelectOpen: () => SizeSelectOpen
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var Default = () => /* @__PURE__ */ React.createElement(import_ids_design_system.Pagination, { total: 120, pageSize: 10, currentPage: 2, onCurrentPageChange: () => {
  } });
  var MidRange = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Pagination,
    {
      total: 240,
      pageSize: 10,
      currentPage: 12,
      onCurrentPageChange: () => {
      },
      showLabel: false
    }
  );
  var Boundaries = () => /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, /* @__PURE__ */ React.createElement(import_ids_design_system.Pagination, { total: 40, pageSize: 10, currentPage: 1, onCurrentPageChange: () => {
  }, showLabel: false }), /* @__PURE__ */ React.createElement(import_ids_design_system.Pagination, { total: 40, pageSize: 10, currentPage: 4, onCurrentPageChange: () => {
  }, showLabel: false }));
  var SizeSelectOpen = () => {
    const ref = React.useRef(null);
    React.useEffect(() => {
      var _a;
      const btn = (_a = ref.current) == null ? void 0 : _a.querySelector('button[role="combobox"]');
      if (btn && btn.getAttribute("aria-expanded") !== "true") btn.click();
    }, []);
    return /* @__PURE__ */ React.createElement("div", { ref }, /* @__PURE__ */ React.createElement(
      import_ids_design_system.Pagination,
      {
        total: 500,
        pageSize: 25,
        currentPage: 3,
        onCurrentPageChange: () => {
        },
        showLabel: false
      }
    ));
  };
  return __toCommonJS(Pagination_exports);
})();
