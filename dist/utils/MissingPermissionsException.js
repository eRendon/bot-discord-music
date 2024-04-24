"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingPermissionsException = void 0;
class MissingPermissionsException {
    permissions;
    message = "Missing permissions:";
    constructor(permissions) {
        this.permissions = permissions;
    }
    toString() {
        return `${this.message} ${this.permissions.join(", ")}`;
    }
}
exports.MissingPermissionsException = MissingPermissionsException;
//# sourceMappingURL=MissingPermissionsException.js.map