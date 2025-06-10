export class FormManager {
  private formData: Map<string, any>;
  private validators: Map<string, (value: any) => boolean>;
  private errors: Map<string, string>;

  constructor() {
    this.formData = new Map();
    this.validators = new Map();
    this.errors = new Map();
  }

  setField(name: string, value: any) {
    this.formData.set(name, value);
    this.validateField(name);
  }

  getField(name: string) {
    return this.formData.get(name);
  }

  setValidator(name: string, validator: (value: any) => boolean) {
    this.validators.set(name, validator);
  }

  validateField(name: string) {
    const value = this.formData.get(name);
    const validator = this.validators.get(name);

    if (validator) {
      const isValid = validator(value);
      if (!isValid) {
        this.errors.set(name, `Invalid value for ${name}`);
      } else {
        this.errors.delete(name);
      }
    }
  }

  validateAll() {
    this.formData.forEach((_, name) => this.validateField(name));
    return this.errors.size === 0;
  }

  getErrors() {
    return Object.fromEntries(this.errors);
  }

  getData() {
    return Object.fromEntries(this.formData);
  }

  reset() {
    this.formData.clear();
    this.errors.clear();
  }
} 