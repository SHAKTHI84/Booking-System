"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const debugController_1 = require("../controllers/debugController");
const router = (0, express_1.Router)();
router.get('/status', debugController_1.getDebugStatus);
router.post('/seed', debugController_1.forceSeedSeats);
exports.default = router;
