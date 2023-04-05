import {
    createCumulativeConversion,
    createIndependentConversion,
    GenericConversion,
    setupPassiveGeneration
} from "features/conversion";
import { createResource, Resource } from "features/resources/resource";
import { GenericFormula } from "game/formulas/types";
import { createLayer } from "game/layers";
import Decimal from "util/bignum";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { ref, unref } from "vue";
import "../utils";

describe("Creating conversion", () => {
    let baseResource: Resource;
    let gainResource: Resource;
    let formula: (x: GenericFormula) => GenericFormula;
    beforeEach(() => {
        baseResource = createResource(ref(40));
        gainResource = createResource(ref(1));
        formula = x => x.div(10).sqrt();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Cumulative conversion", () => {
        describe("Calculates currentGain correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.currentGain)).compare_tolerance(100);
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.currentGain)).compare_tolerance(99);
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.currentGain)).compare_tolerance(100);
            });
        });
        describe("Calculates actualGain correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.actualGain)).compare_tolerance(100);
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.actualGain)).compare_tolerance(99);
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.actualGain)).compare_tolerance(100);
            });
        });
        describe("Calculates currentAt correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.currentAt)).compare_tolerance(
                    Decimal.pow(100, 2).times(10)
                );
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.currentAt)).compare_tolerance(Decimal.pow(99, 2).times(10));
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.currentAt)).compare_tolerance(
                    Decimal.pow(100, 2).times(10)
                );
            });
        });
        describe("Calculates nextAt correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(101, 2).times(10));
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(100, 2).times(10));
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(101, 2).times(10));
            });
        });
        test("Converts correctly", () => {
            const conversion = createCumulativeConversion(() => ({
                baseResource,
                gainResource,
                formula
            }));
            conversion.convert();
            expect(baseResource.value).compare_tolerance(0);
            expect(gainResource.value).compare_tolerance(3);
        });
        describe("Obeys buy max", () => {
            test("buyMax = false", () => {
                const conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: false
                }));
                expect(unref(conversion.actualGain)).compare_tolerance(1);
            });
            test("buyMax = true", () => {
                const conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
                expect(unref(conversion.actualGain)).compare_tolerance(2);
            });
        });
        test("Spends correctly", () => {
            const conversion = createCumulativeConversion(() => ({
                baseResource,
                gainResource,
                formula
            }));
            conversion.convert();
            expect(baseResource.value).compare_tolerance(0);
        });
        test("Calls onConvert", () => {
            const onConvert = vi.fn();
            const conversion = createCumulativeConversion(() => ({
                baseResource,
                gainResource,
                formula,
                onConvert
            }));
            conversion.convert();
            expect(onConvert).toHaveBeenCalled();
        });
    });

    describe("Independent conversion", () => {
        describe("Calculates currentGain correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.currentGain)).compare_tolerance(100);
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.currentGain)).compare_tolerance(99);
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.currentGain)).compare_tolerance(100);
            });
        });
        describe("Calculates actualGain correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.actualGain)).compare_tolerance(99);
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.actualGain)).compare_tolerance(98);
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.actualGain)).compare_tolerance(99);
            });
        });
        describe("Calculates currentAt correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.currentAt)).compare_tolerance(
                    Decimal.pow(100, 2).times(10)
                );
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.currentAt)).compare_tolerance(Decimal.pow(99, 2).times(10));
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.currentAt)).compare_tolerance(
                    Decimal.pow(100, 2).times(10)
                );
            });
        });
        describe("Calculates nextAt correctly", () => {
            let conversion: GenericConversion;
            beforeEach(() => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
            });
            test("Exactly enough", () => {
                baseResource.value = Decimal.pow(100, 2).times(10);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(101, 2).times(10));
            });
            test("Just under", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).sub(1);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(100, 2).times(10));
            });
            test("Just over", () => {
                baseResource.value = Decimal.pow(100, 2).times(10).add(1);
                expect(unref(conversion.nextAt)).compare_tolerance(Decimal.pow(101, 2).times(10));
            });
        });
        test("Converts correctly", () => {
            const conversion = createIndependentConversion(() => ({
                baseResource,
                gainResource,
                formula
            }));
            conversion.convert();
            expect(baseResource.value).compare_tolerance(0);
            expect(gainResource.value).compare_tolerance(2);
        });
        describe("Obeys buy max", () => {
            test("buyMax = false", () => {
                const conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: false
                }));
                baseResource.value = 90;
                expect(unref(conversion.actualGain)).compare_tolerance(1);
            });
            test("buyMax = true", () => {
                const conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    buyMax: true
                }));
                baseResource.value = 90;
                expect(unref(conversion.actualGain)).compare_tolerance(2);
            });
        });
        test("Spends correctly", () => {
            const conversion = createIndependentConversion(() => ({
                baseResource,
                gainResource,
                formula
            }));
            conversion.convert();
            expect(baseResource.value).compare_tolerance(0);
        });
        test("Calls onConvert", () => {
            const onConvert = vi.fn();
            const conversion = createIndependentConversion(() => ({
                baseResource,
                gainResource,
                formula,
                onConvert
            }));
            conversion.convert();
            expect(onConvert).toHaveBeenCalled();
        });
    });
    describe("Custom conversion", () => {
        describe("Custom cumulative", () => {
            let conversion: GenericConversion;
            const convert = vi.fn();
            const spend = vi.fn();
            const onConvert = vi.fn();
            beforeAll(() => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    currentGain() {
                        return 10;
                    },
                    actualGain() {
                        return 5;
                    },
                    currentAt() {
                        return 100;
                    },
                    nextAt() {
                        return 1000;
                    },
                    convert,
                    spend,
                    onConvert
                }));
            });
            afterEach(() => {
                vi.resetAllMocks();
            });
            test("Calculates currentGain correctly", () => {
                expect(unref(conversion.currentGain)).compare_tolerance(10);
            });
            test("Calculates actualGain correctly", () => {
                expect(unref(conversion.actualGain)).compare_tolerance(5);
            });
            test("Calculates currentAt correctly", () => {
                expect(unref(conversion.currentAt)).compare_tolerance(100);
            });
            test("Calculates nextAt correctly", () => {
                expect(unref(conversion.nextAt)).compare_tolerance(1000);
            });
            test("Calls convert", () => {
                conversion.convert();
                expect(convert).toHaveBeenCalled();
            });
            test("Calls spend and onConvert", () => {
                conversion = createCumulativeConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    spend,
                    onConvert
                }));
                conversion.convert();
                expect(spend).toHaveBeenCalled();
                expect(spend).toHaveBeenCalledWith(expect.compare_tolerance(2));
                expect(onConvert).toHaveBeenCalled();
                expect(onConvert).toHaveBeenCalledWith(expect.compare_tolerance(2));
            });
        });
        describe("Custom independent", () => {
            let conversion: GenericConversion;
            const convert = vi.fn();
            const spend = vi.fn();
            const onConvert = vi.fn();
            beforeAll(() => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    currentGain() {
                        return 10;
                    },
                    actualGain() {
                        return 5;
                    },
                    currentAt() {
                        return 100;
                    },
                    nextAt() {
                        return 1000;
                    },
                    convert,
                    spend,
                    onConvert
                }));
            });
            afterEach(() => {
                vi.resetAllMocks();
            });
            test("Calculates currentGain correctly", () => {
                expect(unref(conversion.currentGain)).compare_tolerance(10);
            });
            test("Calculates actualGain correctly", () => {
                expect(unref(conversion.actualGain)).compare_tolerance(5);
            });
            test("Calculates currentAt correctly", () => {
                expect(unref(conversion.currentAt)).compare_tolerance(100);
            });
            test("Calculates nextAt correctly", () => {
                expect(unref(conversion.nextAt)).compare_tolerance(1000);
            });
            test("Calls convert", () => {
                conversion.convert();
                expect(convert).toHaveBeenCalled();
            });
            test("Calls spend and onConvert", () => {
                conversion = createIndependentConversion(() => ({
                    baseResource,
                    gainResource,
                    formula,
                    spend,
                    onConvert
                }));
                conversion.convert();
                expect(spend).toHaveBeenCalled();
                expect(spend).toHaveBeenCalledWith(expect.compare_tolerance(1));
                expect(onConvert).toHaveBeenCalled();
                expect(onConvert).toHaveBeenCalledWith(expect.compare_tolerance(1));
            });
        });
    });
});

describe("Passive generation", () => {
    let baseResource: Resource;
    let gainResource: Resource;
    let formula: (x: GenericFormula) => GenericFormula;
    beforeEach(() => {
        baseResource = createResource(ref(40));
        gainResource = createResource(ref(1));
        formula = x => x.div(10).sqrt();
    });
    test("Rate is 0", () => {
        const conversion = createCumulativeConversion(() => ({
            baseResource,
            gainResource,
            formula
        }));
        const layer = createLayer("dummy", () => ({ display: "" }));
        setupPassiveGeneration(layer, conversion, 0);
        layer.emit("preUpdate", 100);
        expect(gainResource.value).compare_tolerance(1);
    });
    test("Rate is 1", () => {
        const conversion = createCumulativeConversion(() => ({
            baseResource,
            gainResource,
            formula
        }));
        const layer = createLayer("dummy", () => ({ display: "" }));
        setupPassiveGeneration(layer, conversion);
        layer.emit("preUpdate", 100);
        expect(gainResource.value).compare_tolerance(201);
    })
    test("Rate is 100", () => {
        const conversion = createCumulativeConversion(() => ({
            baseResource,
            gainResource,
            formula
        }));
        const layer = createLayer("dummy", () => ({ display: "" }));
        setupPassiveGeneration(layer, conversion, () => 100);
        layer.emit("preUpdate", 100);
        expect(gainResource.value).compare_tolerance(20001);
    })
    test("Obeys cap", () => {
        const conversion = createCumulativeConversion(() => ({
            baseResource,
            gainResource,
            formula
        }));
        const layer = createLayer("dummy", () => ({ display: "" }));
        setupPassiveGeneration(layer, conversion, 100, () => 100);
        layer.emit("preUpdate", 100);
        expect(gainResource.value).compare_tolerance(100);
    })
});
