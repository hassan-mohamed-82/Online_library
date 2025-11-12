"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("../user/auth/index"));
const category_1 = __importDefault(require("./category"));
const authenticated_1 = require("../../middlewares/authenticated");
const route = (0, express_1.Router)();
route.use("/auth", index_1.default);
route.use(authenticated_1.authenticated);
route.use("/categories", category_1.default);
exports.default = route;
