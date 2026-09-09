"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const payment_plans_controller_1 = require("./payment-plans.controller");
const payment_plans_service_1 = require("./payment-plans.service");
let PaymentPlansBootstrap = class PaymentPlansBootstrap {
    paymentPlans;
    constructor(paymentPlans) {
        this.paymentPlans = paymentPlans;
    }
    async onModuleInit() {
        await this.paymentPlans.ensureDefaults();
    }
};
PaymentPlansBootstrap = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_plans_service_1.PaymentPlansService])
], PaymentPlansBootstrap);
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_2.Module)({
        controllers: [payments_controller_1.PaymentsController, payment_plans_controller_1.PaymentPlansController],
        providers: [payments_service_1.PaymentsService, payment_plans_service_1.PaymentPlansService, PaymentPlansBootstrap],
        exports: [payments_service_1.PaymentsService, payment_plans_service_1.PaymentPlansService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map