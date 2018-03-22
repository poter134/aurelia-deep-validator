import { BindingEngine, Disposable, PropertyObserver, NewInstance, computedFrom } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection';

type ValidatableType = string | number | Date | boolean | IValidatable | Array<IValidatable>;

interface IValidatable extends Disposable {
    validate(): boolean;
}

function isIValidatable(object: any): object is IValidatable {
    return (object as IValidatable).validate !== undefined;
}

export class ValidatableProperty<T extends ValidatableType> implements IValidatable {

    constructor(ruleSets: Array<RuleSet<T>>, onChange? : () => any) {
        this._ruleSets = ruleSets;
        this._onChange = onChange || (() => { });

        let b = <BindingEngine>Container.instance.get(BindingEngine);
        this._subscription = b.propertyObserver(this, "value").subscribe((newValue, oldValue) => {
            this.value = newValue;
            this.validate();
            this._onChange();
        });
    } 

    private _ruleSets: Array<RuleSet<T>>;
    private _onChange? : () => any;
    private _subscription: Disposable;

    public value: T; 
    protected error: string; 

    public validate() : boolean {
        let error = "";
        this._ruleSets.some(x => {
            if(!x.condition || x.condition.predicate(this.value)) {
                if(x.rules.some(y => {
                    if(!y.predicate(this.value)) {
                        error = y.message();
                        return true;
                    }
                }))
                    return true;
            }
        });
        this.error = error;
        return this.error.length == 0;
    }

    public dispose(): void {
        if(this._subscription)
            this._subscription.dispose();
    }
}

export class ValidatableObject implements IValidatable {

    public validate(): boolean {
        let isValid: boolean = true;
        let o = (<any>this);
        Object.keys(o).forEach(k => {
            if(isIValidatable(o[k]))
                if(!(<IValidatable>o[k]).validate())
                    isValid = false;
        });
        return isValid;
    }

    public dispose(): void {
        let o = (<any>this);
        Object.keys(o).forEach(k => {
            if(isIValidatable(o[k]))
                (<IValidatable>o[k]).dispose();
        });
    }
}

export class ValidatableArray<T extends IValidatable> implements IValidatable  {

    constructor(ruleSets: Array<RuleSet<Array<T>>>, modelBuilder: () => T, onChange?: () => any) {
        this._ruleSets = ruleSets;
        this._modelBuilder = modelBuilder;
        this._onChange = onChange || (() => { });
    }

    private _ruleSets: Array<RuleSet<Array<T>>>;
    private _modelBuilder: () => T;
    private _onChange? : () => any;

    protected values: Array<T> = [];
    protected error: string; 

    public validate() : boolean {
        let childInvalid = true;
        this.values.forEach(x => {
            if(!x.validate())
                 childInvalid = true;
        });
        let error = "";
        this._ruleSets.some(x => {
            if(!x.condition || x.condition.predicate(this.values)) {
                if(x.rules.some(y => {
                    if(!y.predicate(this.values)) {
                        error = y.message();
                        return true;
                    }
                }))
                return true;
            }
        });
        this.error = error;
        return this.error.length == 0 && !childInvalid;
    }

    public dispose(): void {
        this.values.forEach(x => x.dispose());
    }

    public clear(): void {
        let cleared = this.values.splice(0, this.values.length);
        cleared.forEach(x => x.dispose());
        this.validate();
        this._onChange();
    }

    public add(): T {
        let t = this._modelBuilder();
        this.values.push(t);
        this.validate();
        this._onChange();
        return t;
    };

    public insert(idx: number): T {
        let t = this._modelBuilder();
        this.values.splice(idx, 0, t);
        this.validate();
        this._onChange(); 
        return t;
    }

    public remove(idx: number): void {
        let removed = this.values.splice(idx, 1);
        if(removed) {
            removed[0].dispose();
            this.validate();
            this._onChange();
        }
    };
}

export class Rule<T extends ValidatableType> {
    constructor(public predicate : (value: T) => boolean, public message: () => string) { }
}

export class RuleSet<T extends ValidatableType> {
    constructor() {
        this.rules = new Array<Rule<T>>();
    }

    public rules: Array<Rule<T>>;
    public condition: Rule<T>;
}

export class RuleBuilder<T extends ValidatableType> {
    constructor() {
        this._ruleSets = new Array<RuleSet<T>>();
        this._currentRuleSet = new RuleSet<T>();
    }

    private _ruleSets: Array<RuleSet<T>>;
    private _currentRuleSet: RuleSet<T>;

    public Enforce(rule: (builder: this) => Rule<T>): this {
        this._currentRuleSet.rules.push(rule(this));
        return this;
    }

    public When(condition: (builder : this) => Rule<T>): this {
        if(this._currentRuleSet && this._currentRuleSet.rules.length > 0) {
            this._ruleSets.push(this._currentRuleSet);  
            this._currentRuleSet = null;
        }
        if(!this._currentRuleSet)
            this._currentRuleSet = new RuleSet<T>();
        this._currentRuleSet.condition =  condition(this);

        return this;
    }

    public Build() : Array<RuleSet<T>> {
        if(this._currentRuleSet && this._currentRuleSet.rules.length > 0) {
            this._ruleSets.push(this._currentRuleSet);
        }
        return this._ruleSets;
    }

    public MustSatisfy = (predicate: (value: T) => boolean, message?: string) => new Rule<T>(predicate, () => message || "failed to satisfy condition");

    public IsEqualTo = (compareTo: T, message?: string) => new Rule<T>(x => x == compareTo, () => message || "must be equal to " + compareTo);

    public IsNotNull = (message?: string) => new Rule<T>(x => !(x == null) && typeof x !== 'undefined',  () => message || "required");

    public IsNull = (message?: string) => new Rule<T>(x => (<any>x == null) || typeof x === 'undefined', () => message || "not required");

    public IsIn = (arr: Array<T>, message?: string) => new Rule<T>(x => arr.indexOf(x) > -1, () => message || "invalid type");
}

export class ArrayRuleBuilder<T extends ValidatableType> extends RuleBuilder<T> {

    public IsNotNullOrEmpty = (message?: string) => new Rule<Array<any>>(x => !(x == null) && typeof x !== 'undefined' && x.length > 0, () => message || "required");

    public HasLengthEqualTo = (length: number, message?: string) => new Rule<Array<any>>(x => x.length == length,  () => message || "length must be equals to " + length);

    public HasLengthGreaterThan = (length: number, message?: string) => new Rule<Array<any>>(x => x.length > length, () => message || "length must be greater than " + length);

    public HasLengthGreaterThanOrEqualTo = (length: number, message?: string) => new Rule<Array<any>>(x => x.length >= length, () => message || "length must be greather than or equal to " + length);

    public HasLengthLessThan = (length: number, message?: string) => new Rule<Array<any>>(x => x.length < length, () => message || "length must be less than " + length);
        
    public HasLengthLessThanOrEqualTo = (length: number, message?: string) => new Rule<Array<any>>(x => x.length <= length, () => message || "length must be less than or equal to " + length);
}

export class StringRuleBuilder extends RuleBuilder<string> {

    public IsNotNullOrEmpty = (message?: string) => new Rule<string>(x => !(x == null) && typeof x !== 'undefined' && x.length > 0, () => message || "required");

    public IsNullOrEmpty = (message?: string) => new Rule<string>(x => x == null || typeof x === 'undefined' || x.length == 0, () => message || "not required");
    
    public HasLengthEqualTo = (length: number, message?: string) => new Rule<string>(x => x.length == length,  () => message || "length must be equals to " + length);

    public HasLengthGreaterThan = (length: number, message?: string) => new Rule<string>(x => x.length > length, () => message || "length must be greater than " + length);

    public HasLengthGreaterThanOrEqualTo = (length: number, message?: string) => new Rule<string>(x => x.length >= length, () => message || "length must be greather than or equal to " + length);

    public HasLengthLessThan = (length: number, message?: string) => new Rule<string>(x => x.length < length, () => message || "length must be less than " + length);
        
    public HasLengthLessThanOrEqualTo = (length: number, message?: string) => new Rule<string>(x => x.length <= length, () => message || "length must be less than or equal to " + length);

    public Matches = (regExp: RegExp, message?: string) => new Rule<string>(x => ((x || "").match(regExp) || []).length > 0, () => message || "invalid format");

    public IsInteger = (message?: string) => this.Matches(/^[-+]?[0-9]*$/, message || "whole numbers only");

    public IsNumeric = (message?: string) => new Rule<string>(x => !isNaN(parseFloat(<any>x)) && isFinite(<any>x),  () => message || "numeric only");

    public IsAlphaNumeric = (message?: string) => this.Matches(/^[-+]?[a-zA-Z0-9]*$/, message || "alpha numeric characters only");

    public IsAbsoluteUri = (message?: string) => this.Matches(/^https:\/\/?[0-9a-z]+\.[-_0-9a-z]+\.[0-9a-z\/]+$/, message || "invalid uri");

    public IsEmailAddress = (message?: string) => this.Matches(/^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-||_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]+|\d|-|\.{0,1}|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])?([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/, message || "invalid email format");
}

export class NumberRuleBuilder extends RuleBuilder<number> {

    public IsInteger = (message?: string) => new Rule<number>(x => Number.isInteger(x), () => message || "must be an integer");

    public IsGreaterThan = (compareTo: number, message?: string) => new Rule<number>(x => x > compareTo, () => message || "must be greater than " + compareTo);

    public IsGreaterThanOrEqualTo = (compareTo: number, message?: string) => new Rule<number>(x => x >= compareTo, () => message || "must be greater than or equal to " + compareTo);

    public IsLessThan = (compareTo: number, message?: string) => new Rule<number>(x => x < compareTo, () => message || "must be less than " + compareTo);

    public IsLessThanOrEqualTo = (compareTo: number, message?: string) => new Rule<number>(x => x <= compareTo, () => message || "must be less than or equal to " + compareTo);
}

export class DateRuleBuilder extends RuleBuilder<Date> {

    public IsGreaterThan = (compareTo: Date, message?: string) => new Rule<Date>(x => x > compareTo, () => message || "must be greater than " + compareTo);

    public IsGreaterThanOrEqualTo = (compareTo: Date, message?: string) => new Rule<Date>(x => x >= compareTo, () => message || "must be greater than or equal to " + compareTo);

    public IsLessThan = (compareTo: Date, message?: string) => new Rule<Date>(x => x < compareTo, () => message || "must be less than " + compareTo);

    public IsLessThanOrEqualTo = (compareTo: Date, message?: string) => new Rule<Date>(x => x <= compareTo, () => message || "must be less than or equal to " + compareTo);
}


