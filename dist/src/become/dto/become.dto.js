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
exports.UpdateBecomeApplicationDto = exports.CreateBecomeApplicationDto = exports.BecomeAnswerInputDto = exports.UpdateBecomeQuestionDto = exports.CreateBecomeQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateBecomeQuestionDto {
    target;
    prompt;
    type;
    options;
    sortOrder;
    isRequired;
    isActive;
}
exports.CreateBecomeQuestionDto = CreateBecomeQuestionDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BecomeTarget),
    __metadata("design:type", String)
], CreateBecomeQuestionDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateBecomeQuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BecomeQuestionType),
    __metadata("design:type", String)
], CreateBecomeQuestionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBecomeQuestionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateBecomeQuestionDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBecomeQuestionDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBecomeQuestionDto.prototype, "isActive", void 0);
class UpdateBecomeQuestionDto {
    target;
    prompt;
    type;
    options;
    sortOrder;
    isRequired;
    isActive;
}
exports.UpdateBecomeQuestionDto = UpdateBecomeQuestionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BecomeTarget),
    __metadata("design:type", String)
], UpdateBecomeQuestionDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateBecomeQuestionDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BecomeQuestionType),
    __metadata("design:type", String)
], UpdateBecomeQuestionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Object)
], UpdateBecomeQuestionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateBecomeQuestionDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBecomeQuestionDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBecomeQuestionDto.prototype, "isActive", void 0);
class BecomeAnswerInputDto {
    questionId;
    answerText;
}
exports.BecomeAnswerInputDto = BecomeAnswerInputDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BecomeAnswerInputDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], BecomeAnswerInputDto.prototype, "answerText", void 0);
class CreateBecomeApplicationDto {
    target;
    name;
    email;
    phone;
    userId;
    answers;
}
exports.CreateBecomeApplicationDto = CreateBecomeApplicationDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BecomeTarget),
    __metadata("design:type", String)
], CreateBecomeApplicationDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateBecomeApplicationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateBecomeApplicationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateBecomeApplicationDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBecomeApplicationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BecomeAnswerInputDto),
    __metadata("design:type", Array)
], CreateBecomeApplicationDto.prototype, "answers", void 0);
class UpdateBecomeApplicationDto {
    status;
    adminNote;
}
exports.UpdateBecomeApplicationDto = UpdateBecomeApplicationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BecomeApplicationStatus),
    __metadata("design:type", String)
], UpdateBecomeApplicationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", Object)
], UpdateBecomeApplicationDto.prototype, "adminNote", void 0);
//# sourceMappingURL=become.dto.js.map