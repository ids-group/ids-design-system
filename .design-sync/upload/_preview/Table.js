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

  // .design-sync/previews/Table.tsx
  var Table_exports = {};
  __export(Table_exports, {
    LoadingSkeleton: () => LoadingSkeleton,
    Paginated: () => Paginated,
    Shipments: () => Shipments
  });
  var React = __toESM(require_react());
  var import_ids_design_system = __toESM(require_ds());
  var shipments = [
    { id: "s1", ref: "ORD-2026-0142", origin: "Leeds LS1 4AP", destination: "Manchester M1 2AB", pallets: 14, eta: "24 Jul 14:30", status: "In transit" },
    { id: "s2", ref: "ORD-2026-0156", origin: "Birmingham B4 7DA", destination: "Bristol BS1 5TR", pallets: 9, eta: "24 Jul 16:05", status: "Loading" },
    { id: "s3", ref: "ORD-2026-0161", origin: "Sheffield S1 2HE", destination: "Rotherham S60 1TG", pallets: 22, eta: "25 Jul 08:15", status: "Scheduled" },
    { id: "s4", ref: "ORD-2026-0178", origin: "Carlisle CA1 1EH", destination: "Glasgow G1 3SL", pallets: 6, eta: "25 Jul 11:40", status: "In transit" },
    { id: "s5", ref: "ORD-2026-0183", origin: "Norwich NR1 3QQ", destination: "Ipswich IP1 1DH", pallets: 11, eta: "25 Jul 15:20", status: "Delayed" },
    { id: "s6", ref: "ORD-2026-0190", origin: "Plymouth PL1 2AA", destination: "Exeter EX1 1GE", pallets: 17, eta: "26 Jul 09:00", status: "Delivered" }
  ];
  var shipmentColumns = [
    { key: "ref", label: "Reference", sortable: true },
    { key: "destination", label: "Destination" },
    { key: "pallets", label: "Pallets", align: "right", sortable: true },
    { key: "eta", label: "ETA" },
    { key: "status", label: "Status" }
  ];
  var backlogColumns = [
    { key: "ref", label: "Reference", sortable: true },
    { key: "origin", label: "Origin" },
    { key: "destination", label: "Destination" },
    { key: "pallets", label: "Pallets", align: "right", sortable: true },
    { key: "eta", label: "ETA" },
    { key: "status", label: "Status" }
  ];
  var Shipments = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Table,
    {
      caption: "Active shipments",
      data: shipments,
      columns: shipmentColumns,
      selectable: true,
      selectedIds: /* @__PURE__ */ new Set(["s1", "s4"]),
      sortKey: "ref",
      sortDir: "asc",
      zebra: true,
      stickyHeader: false,
      bulkActions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", size: "sm", icon: "archive" }, "Archive"), /* @__PURE__ */ React.createElement(import_ids_design_system.Button, { color: "neutral", variant: "outline", size: "sm", icon: "download" }, "Export"))
    }
  );
  var LoadingSkeleton = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Table,
    {
      caption: "Loading shipments",
      data: [],
      columns: backlogColumns,
      loading: "skeleton",
      skeletonRows: 5,
      stickyHeader: false
    }
  );
  var backlog = [
    ...shipments,
    { id: "s7", ref: "ORD-2026-0204", origin: "Cardiff CF10 1EP", destination: "Swansea SA1 1NW", pallets: 8, eta: "26 Jul 13:45", status: "Scheduled" },
    { id: "s8", ref: "ORD-2026-0211", origin: "Newcastle NE1 4ST", destination: "Edinburgh EH1 1BB", pallets: 19, eta: "27 Jul 07:50", status: "Scheduled" }
  ];
  var Paginated = () => /* @__PURE__ */ React.createElement(
    import_ids_design_system.Table,
    {
      caption: "Shipment backlog",
      data: backlog,
      columns: backlogColumns,
      pageSize: 5,
      bordered: true,
      stickyHeader: false
    }
  );
  return __toCommonJS(Table_exports);
})();
