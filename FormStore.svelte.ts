type FormStoreSanitizer<FD, Sanitized> = (fd: FD) => Sanitized;
type FormStoreErrorLogger = (key: string, msg: string) => void;
type FormStoreValidator<Sanitized> = (fd: Sanitized, err: FormStoreErrorLogger) => void;
type FormStoreConfig<FD, Sanitized> = {
    initialState: FD
    sanitizer: FormStoreSanitizer<FD, Sanitized>
    validator: FormStoreValidator<Sanitized>
}

class FormStore<FD, Sanitized = FD> {
    state: FD = $state({}) as FD;
    errors: Map<string, string> = $state(new Map());
    sanitized: Sanitized = $state({}) as Sanitized;
    valid: boolean = true;

    static sanitizeString(str: string): string {
        return str.trim().replaceAll(/\s+/gm, " ")
    }


    constructor(config: FormStoreConfig<FD, Sanitized>) {
        this.state = config.initialState
        $effect(() => {
            this.#resetErrors()
            this.sanitized = config.sanitizer(this.state)
            config.validator(this.sanitized, this.err.bind(this))
            if (Object.keys(this.errors).length === 0) this.valid = true;
        })
    }

    checkUnique(arr: any[], key: string, onMatch: (indices: [number, number], items: [any, any]) => void) {
        arr.forEach((a, i) => {
            arr.forEach((b, j) => {
                if ((a !== b) && (a[key] === b[key])) {
                    onMatch([i, j], [a, b])
                }
            })
        })
    }

    #resetErrors() {
        this.errors = new Map();
        this.valid = false;
    }

    err(key: string, msg: string) {
        this.errors.set(key, msg)
    }

    errMsg(key: string): string {
        return this.errors.get(key) || ""
    }
}

export default FormStore