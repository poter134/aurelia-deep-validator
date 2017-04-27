import {autoinject, BindingEngine, Disposable, PropertyObserver} from 'aurelia-framework';

export class RuleBuilder<T> {

    public CustomRule(predicate: (vObj: Validator<T>, pObj: any, cObj: any, key: string) => boolean, msg: string = null): Rule<T> {
        return new Rule<T>(predicate, () => msg || "invalid")
    };

    public NotNull(msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o, () => msg || "required");
    };

    public NotNullOrEmpty(msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o && o.length > 0, () => msg || "required");
    };

    public EqualTo(n: any, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o == n, () => msg);
    };

    public GreaterThan(n: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => <number>o > n, () => msg || "must be greater than " + n);
    };

    public GreaterThanOrEqualTo(n: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => <number>o >= n, () => msg || "must be greater than or equal to " + n);
    };

    public LessThan(n: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => <number>o < n, () => msg || "must be less than " + n);
    };

    public LessThanOrEqualTo(n: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => <number>o <= n, () => msg || "must be less than or equal to " + n);
    };

    public LengthGreaterThan(min: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o.length > min, () => msg || "length must be greater than " + min + " characters");
    }

    public LengthGreaterThanOrEqualTo(min: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o.length >= min, () => msg || "length must be greater than or equal to " + min + " characters");
    }

    public LengthLessThan(max: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o.length < max, () => msg || "length must be less than " + max + " characters");
    }

    public LengthLessThanOrEqualTo(max: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o.length <= max, () => msg || "length must be less than or equal to " + max + " characters");
    }

    public LengthBetween(min: number, max: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o.length >= min && o.length <= max, () => msg || "length must be between " + min + " and " + max);
    };

    public Between(min: number, max: number, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => o >= min && o <= max, () => msg || "must be between " + min + " and " + max);
    };

    public Matches(regExp: RegExp, msg: string = null) {
        return new Rule<T>((v, p, o, k) => (((<string>o).match(regExp) || []).length > 0), () => msg || "invalid format");
    };

    public AbsoluteUri(msg: string = null): Rule<T> {
        return this.Matches(/^https:\/\/?[0-9a-z]+\.[-_0-9a-z]+\.[0-9a-z\/]+$/, msg || "invalid uri");
    }

    public ValidId(msg: string = null): Rule<T> {
        return this.Matches(/^(?!.*--)[a-z0-9][a-z0-9-]*?[a-z0-9]$/, msg || "invalid id format");
    }

    public ValidSplitId(msg: string = null): Rule<T> {
        return this.Matches(/^(?!.*--)([a-z0-9][a-z0-9-]*?[a-z0-9]$|[a-z0-9][a-z0-9-]*?[a-z0-9][.][a-z0-9][a-z0-9-]*?[a-z0-9]$)/, msg || "invalid id format");
    }

    public EmailAddress(msg: string = null): Rule<T> {
        return this.Matches(/^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-||_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]+|\d|-|\.{0,1}|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])?([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/, msg || "invalid email format");
    };

    public StrongPassword(msg: string = null): Rule<T> {
        return this.Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[-+_!@#$%^&*.,?])).+$/, msg || "failed password complexity");
    };

    public UKPostcode(msg: string = null): Rule<T> {
        return this.Matches(/^(([gG][iI][rR] {0,}0[aA]{2})|((([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y]?[0-9][0-9]?)|(([a-pr-uwyzA-PR-UWYZ][0-9][a-hjkstuwA-HJKSTUW])|([a-pr-uwyzA-PR-UWYZ][a-hk-yA-HK-Y][0-9][abehmnprv-yABEHMNPRV-Y]))) {0,}[0-9][abd-hjlnp-uw-zABD-HJLNP-UW-Z]{2}))$/, msg || "invalid uk postcode format");
    };

    public In<R>(arr: Array<R>, msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => arr.indexOf(<R>o) > -1, () => msg || "invalid type");
    };

    public IntegerOnly(msg: string = null): Rule<T> {
        return this.Matches(/^[-+]?[0-9]*$/, msg || "whole numbers only");
    }

    public NumericOnly(msg: string = null): Rule<T> {
        return new Rule<T>((v, p, o, k) => !isNaN(parseFloat(o)) && isFinite(o), () => msg || "numeric values only");
    }

}

export class RuleSet<T> {
    constructor(public ruleChains: Array<RuleChain<T>>, public activators: Array<string>) { }
}

export class RuleChain<T> {
    constructor(public rules: Array<Rule<T>>, public condition: Rule<T> = null) { }
}

export class Rule<T> {
    constructor(public predicate: (vObj: Validator<T>, pObj: any, cObj: any, key: string) => boolean, public message: () => string) { }
}

export class Validator<T> {
    private _bindingEngine: BindingEngine;
    private _subscriptionMap: Map<string, Array<Disposable>> = new Map<string, Array<Disposable>>();
    private _activatorRuleSetMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    private _ruleChainMap: Map<string, Array<RuleChain<T>>> = new Map<string, Array<RuleChain<T>>>();
    private _isValid: boolean = true;

    public instance: T;
    public errors: Object = {};

    constructor(bindingEngine: BindingEngine, ruleSets: Map<string, RuleSet<T>>, instance: T) {
        var self = this;

        self._bindingEngine = bindingEngine;
        self.instance = instance;
        ruleSets.forEach((rs, rsk) => {
            rs.activators.forEach(ak => {
                let map = self._activatorRuleSetMap.get(ak);
                if (!map)
                    self._activatorRuleSetMap.set(ak, [rsk]);
                else
                    if (map.indexOf(rsk) < 0)
                        map.push(rsk);
            });
            self._ruleChainMap.set(rsk, rs.ruleChains);
        });

        self._activatorRuleSetMap.forEach((rsm, rsmk) => {
            var impNodeKeys = self._getNodeKeys(rsmk);
            self._subscribe(rsmk, impNodeKeys, instance, "", 0);
        });
    }

    dispose(): void {
        this._subscriptionMap.forEach(x => x.forEach(y => y.dispose()));
        this._subscriptionMap.clear();
        this._activatorRuleSetMap.clear();
        this._ruleChainMap.clear();
    }

    validate(): boolean {
        var self = this;
        self._isValid = true;
        self._ruleChainMap.forEach((rc, rck) => {
            var impNodeKeys = self._getNodeKeys(rck);
            self._validate(rck, impNodeKeys, self.instance, "", 0);
        });
        return self._isValid;
    }

    private _arrayChangeHandler(parentObj: any, expObj: any, expKey: string, impKey: string) {
        var self = this;

        return (splices) => {
            // unsubscribe children
            self._unsubscribeChildren(expKey);

            // resubscribe dependents
            var expNodeKeys = self._getNodeKeys(expKey + '[$]');
            self._activatorRuleSetMap.forEach((rsm, rsmk) => {
                if (impKey != rsmk && rsmk.indexOf(impKey) == 0) {
                    // dependendant key
                    var depNodeKeys = self._getNodeKeys(rsmk);
                    for (var i = 0; i < expNodeKeys.length; i++) {
                        depNodeKeys[i] = expNodeKeys[i];
                    }
                    for (var i = 0; i < expObj.length; i++) {
                        var arrExpKey = expKey + '[' + i + ']';
                        var arrExpObj = expObj[i];
                        self._subscribe(rsmk, depNodeKeys, arrExpObj, arrExpKey, expNodeKeys.length);
                        self._validate(rsmk, depNodeKeys, arrExpObj, arrExpKey, expNodeKeys.length);
                    }
                }
            });

            // validate
            var ruleSetKeys = self._activatorRuleSetMap.get(impKey);
            if (ruleSetKeys) {
                ruleSetKeys.forEach(ruleImpKey => {
                    if (impKey == ruleImpKey) {
                        //invoke directly since we have the expKey and expObj
                        self._ruleChainMap.get(ruleImpKey).some((chain, chainIdx, chainArr) => {
                            let error = "";
                            if (!chain.condition || chain.condition.predicate(self, parentObj, expObj, expKey)) {
                                chain.rules.some((rule, ruleIdx, ruleArr) => {
                                    if (!rule.predicate(self, parentObj, expObj, expKey))
                                        error = rule.message();
                                    return error.length > 0;
                                });
                            };
                            if (error.length > 0)
                                self._isValid = false;
                            self.errors[expKey] = error;
                            return error.length > 0;
                        });
                    }
                    else if (ruleImpKey.indexOf(impKey) == 0) {
                        // invoke explicit sub-chain
                        var expNodeKeys = self._getNodeKeys(expKey);
                        var nodeKeys = self._getNodeKeys(ruleImpKey);
                        // replace impNodeKeys with explicit up to the point where the substring ends
                        for (var i = 0; i < expNodeKeys.length; i++) {
                            nodeKeys[i] = expNodeKeys[i];
                        }
                        self._validate(ruleImpKey, nodeKeys, self.instance, "", 0);
                    }
                    else {
                        // invoke implicit chain
                        var impNodeKeys = self._getNodeKeys(ruleImpKey);
                        self._validate(ruleImpKey, impNodeKeys, self.instance, "", 0);
                    }
                });
            }
        };
    }

    private _propertyChangeHandler(parentObj: any, expKey: string, impKey: string) {
        var self = this;

        return (newValue, oldValue) => {
            self._unsubscribeChildren(expKey);

            if (newValue) {
                // re-subscribe children if not null
                if (Array.isArray(newValue)) {
                    var expNodeKeys = self._getNodeKeys(expKey + '[$]');
                    self._activatorRuleSetMap.forEach((rsm, rsmk) => {
                        if (impKey != rsmk && rsmk.indexOf(impKey) == 0) {
                            // dependendant key
                            var depNodeKeys = self._getNodeKeys(rsmk);
                            for (var i = 0; i < expNodeKeys.length; i++) {
                                depNodeKeys[i] = expNodeKeys[i];
                            }
                            for (var i = 0; i < newValue.length; i++) {
                                var arrExpKey = expKey + '[' + i + ']';
                                var arrExpObj = newValue[i];
                                self._subscribe(rsmk, depNodeKeys, arrExpObj, arrExpKey, expNodeKeys.length);
                                self._validate(rsmk, depNodeKeys, arrExpObj, arrExpKey, expNodeKeys.length);
                            }
                        }
                    });
                } else {
                    var expNodeKeys = self._getNodeKeys(expKey);
                    self._activatorRuleSetMap.forEach((rsm, rsmk) => {
                        if (impKey != rsmk && rsmk.indexOf(impKey) == 0) {
                            // dependendant key
                            var depNodeKeys = self._getNodeKeys(rsmk);
                            for (var i = 0; i < expNodeKeys.length; i++) {
                                depNodeKeys[i] = expNodeKeys[i];
                            }
                            self._subscribe(rsmk, depNodeKeys, newValue, expKey, expNodeKeys.length);
                            self._validate(rsmk, depNodeKeys, newValue, expKey, expNodeKeys.length);
                        }
                    });
                }
            }

            // validate
            var ruleSetKeys = self._activatorRuleSetMap.get(impKey);
            if (ruleSetKeys) {
                ruleSetKeys.forEach(ruleImpKey => {
                    if (impKey == ruleImpKey) {
                        //invoke directly since we have the expKey and expObj
                        self._ruleChainMap.get(ruleImpKey).some((chain, chainIdx, chainArr) => {
                            let error = "";
                            self.errors[expKey] = "";
                            if (!chain.condition || chain.condition.predicate(self, parentObj, newValue, expKey)) {
                                chain.rules.some((rule, ruleIdx, ruleArr) => {
                                    if (!rule.predicate(self, parentObj, newValue, expKey))
                                        error = rule.message();
                                    return error.length > 0;
                                });
                            };
                            if (error.length > 0) {
                                self._isValid = false;
                                self.errors[expKey] = error;
                            }
                            return error.length > 0;
                        });
                    }
                    else if (ruleImpKey.indexOf(impKey) == 0) {
                        // invoke explicit sub-chain
                        var expNodeKeys = self._getNodeKeys(expKey);
                        var nodeKeys = self._getNodeKeys(ruleImpKey);
                        // replace impNodeKeys with explicit up to the point where the substring ends
                        for (var i = 0; i < expNodeKeys.length; i++) {
                            nodeKeys[i] = expNodeKeys[i];
                        }
                        self._validate(ruleImpKey, nodeKeys, self.instance, "", 0);
                    }
                    else {
                        // invoke implicit chain
                        var impNodeKeys = self._getNodeKeys(ruleImpKey);
                        self._validate(ruleImpKey, impNodeKeys, self.instance, "", 0);
                    }
                });
            }
        };
    }

    private _getNodeKeys(key: string): Array<string> {
        return key.split('.');
    }

    private _getArrayIndex(nodeKey: string): string {
        var idxStart = nodeKey.indexOf('[') + 1;
        return nodeKey.substr(idxStart, nodeKey.length - (idxStart + 1));
    }

    private _getArrayName(nodeKey: string): string {
        return nodeKey.substr(0, nodeKey.indexOf('['));
    }

    private _validate(impRoot: string, nodeKeys: Array<string>, parent: any, parentExpKey: string, level: number): void {
        var self = this;

        if (!parent)
            return;

        var curNodeKey = nodeKeys[level];
        if (curNodeKey.endsWith(']')) {
            // ensure next level property
            if (level + 1 < nodeKeys.length) {
                var arrName = self._getArrayName(curNodeKey);
                var arrIdx = self._getArrayIndex(curNodeKey);
                if (arrIdx == '$') {
                    // loop through parent array items
                    for (var i = 0; i < parent[arrName].length; i++) {
                        let expKey = parentExpKey.length > 0 ? (parentExpKey + '.' + curNodeKey.replace("$", '' + i)) : curNodeKey.replace("$", '' + i);
                        let expObj = parent[arrName][i];
                        self._validate(impRoot, nodeKeys, expObj, expKey, level + 1);
                    }
                } else {
                    // traverse to explicit array item
                    let expKey = parentExpKey.length > 0 ? (parentExpKey + '.' + curNodeKey) : curNodeKey;
                    let expObj = parent[arrName][arrIdx];
                    self._validate(impRoot, nodeKeys, expObj, expKey, level + 1);
                }
            }
        } else {
            let expKey = parentExpKey.length > 0 ? (parentExpKey + '.' + curNodeKey) : curNodeKey;
            let expObj = parent[curNodeKey];

            if (level + 1 < nodeKeys.length) {
                // traverse to child property
                self._validate(impRoot, nodeKeys, expObj, expKey, level + 1);
            } else {
                // end property level - invoke rule chain
                self._ruleChainMap.get(impRoot).some((chain, chainIdx, chainArr) => {
                    let error = "";
                    self.errors[expKey] = "";
                    if (!chain.condition || chain.condition.predicate(self, parent, expObj, expKey)) {
                        chain.rules.some((rule, ruleIdx, ruleArr) => {
                            if (!rule.predicate(self, parent, expObj, expKey))
                                error = rule.message();
                            return error.length > 0;
                        });
                    };
                    if (error.length > 0) {
                        self.errors[expKey] = error;
                        self._isValid = false;
                    }
                    return error.length > 0;
                });
            }
        }
    }

    private _subscribe(impRoot: string, nodeKeys: Array<string>, parent: any, parentExpKey: string, level: number): void {
        var self = this;

        if (!parent)
            return;

        var curNodeKey = nodeKeys[level];
        if (curNodeKey.endsWith(']')) {
            // ensure next level property
            if (level + 1 < nodeKeys.length) {
                // check to see if parent array has subscriptions
                var arrName = self._getArrayName(curNodeKey);
                var arrExpKey = parentExpKey.length > 0 ? (parentExpKey + "." + arrName) : arrName;

                if (!self._subscriptionMap.get(arrExpKey)) {
                    var arrExpObj = parent[arrName];
                    // reconstruct implicit key
                    var impNodeKeys = self._getNodeKeys(impRoot);
                    impNodeKeys = impNodeKeys.splice(0, level);
                    impNodeKeys.push(arrName);
                    var arrImpKey = impNodeKeys.join('.');

                    var subs = new Array<Disposable>();
                    subs.push(self._bindingEngine.collectionObserver(arrExpObj).subscribe(self._arrayChangeHandler(parent, arrExpObj, arrExpKey, arrImpKey)));
                    subs.push(self._bindingEngine.propertyObserver(parent, arrName).subscribe(self._propertyChangeHandler(parent, arrExpKey, arrImpKey)));
                    self._subscriptionMap.set(arrExpKey, subs);
                }

                var arrIdx = self._getArrayIndex(curNodeKey);
                if (arrIdx == '$') {
                    // loop through and subscribe all children
                    for (var i = 0; i < parent[arrName].length; i++) {
                        let expKey = parentExpKey.length > 0 ? (parentExpKey + '.' + curNodeKey.replace("$", '' + i)) : curNodeKey.replace("$", '' + i);
                        let expObj = parent[arrName][i];
                        self._subscribe(impRoot, nodeKeys, expObj, expKey, level + 1);
                    }
                } else {
                    // traverse to explicit array item
                    let expKey = parentExpKey.length > 0 ? (parentExpKey + '.' + curNodeKey) : curNodeKey;
                    let expObj = parent[arrName][arrIdx];
                    self._subscribe(impRoot, nodeKeys, expObj, expKey, level + 1);
                }
            }
        } else {
            let expKey = parentExpKey.length > 0 ? (parentExpKey + "." + curNodeKey) : curNodeKey;
            let expObj = parent[curNodeKey];

            if (!self._subscriptionMap.has(expKey)) {
                // reconstruct implicit key
                var impNodeKeys = self._getNodeKeys(impRoot);
                impNodeKeys = impNodeKeys.splice(0, level + 1);
                var impKey = impNodeKeys.join('.');

                var subs = new Array<Disposable>();
                if (Array.isArray(expObj))
                    subs.push(self._bindingEngine.collectionObserver(expObj).subscribe(self._arrayChangeHandler(parent, expObj, expKey, impKey)));
                subs.push(self._bindingEngine.propertyObserver(parent, curNodeKey).subscribe(self._propertyChangeHandler(parent, expKey, impKey)));
                self._subscriptionMap.set(expKey, subs);
            }

            if (level + 1 < nodeKeys.length && expObj) {
                self._subscribe(impRoot, nodeKeys, expObj, expKey, level + 1);
            }
        }
    }

    private _unsubscribeChildren(expRoot: string): void {
        var self = this;

        self._subscriptionMap.forEach((sm, smk) => {
            if (smk.indexOf(expRoot) == 0 && expRoot !== smk) {
                // unsubscribe dependencies
                var subs = self._subscriptionMap.get(smk);
                subs.forEach(x => x.dispose());
                self._subscriptionMap.delete(smk);
            }
        });
    }
}

export abstract class ValidatorFactory<T> {
    constructor(private bindingEngine: BindingEngine) { }

    protected rules: RuleBuilder<T> = new RuleBuilder<T>();
    protected createRuleSet = (ruleChains: Array<RuleChain<T>>, activators: Array<string>): RuleSet<T> => new RuleSet<T>(ruleChains, activators);
    protected createRuleChain = (rules: Array<Rule<T>>, condition: Rule<T> = null): RuleChain<T> => new RuleChain<T>(rules, condition);
    protected ruleSets: Map<string, RuleSet<T>> = new Map<string, RuleSet<T>>();

    public createValidator = (instance: T): Validator<T> => new Validator<T>(this.bindingEngine, this.ruleSets, instance);
}