var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
let Staff = class Staff {
    id;
    discordId;
    discordUsername;
    discordDisplayName;
    discordRole;
    discordAvatar;
    totalTickets;
    totalOpenTickets;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Staff.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Staff.prototype, "discordId", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Staff.prototype, "discordUsername", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Staff.prototype, "discordDisplayName", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Staff.prototype, "discordRole", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Staff.prototype, "discordAvatar", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Staff.prototype, "totalTickets", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Staff.prototype, "totalOpenTickets", void 0);
Staff = __decorate([
    Entity()
], Staff);
export { Staff };
