export class UserAlreadyExistsError extends Error {
    constructor() {
        super("CPF, e-mail ou e-mail institucional já cadastrado");
        this.name = "UserAlreadyExistsError";
    }
}
